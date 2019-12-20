const PLUGIN_NAME = 'gulp-pug-i18n';
const debug = require('debug')(PLUGIN_NAME);
const path = require('path');
const through = require('through2');
const PluginError = require('plugin-error');
const Vinyl = require('vinyl');
const yaml = require('js-yaml');
const pug = require('pug');
const map = require('map-stream');
const vfs = require('vinyl-fs');
const { makeFilename } = require('./utils');

function plugin(options) {
  options = Object.assign({}, options);

  if (typeof options !== 'object') {
    throw new PluginError(
      PLUGIN_NAME,
      'Initialization parameter must be an object',
    );
  }

  if (options.hasOwnProperty('i18n') === false) {
    throw new PluginError(PLUGIN_NAME, 'Object must have “i18n” object');
  }

  if (options.i18n.hasOwnProperty('locales') === false) {
    throw new PluginError(PLUGIN_NAME, '“locales” property is required');
  }

  if (typeof options.i18n.namespace !== 'string') {
    options.i18n.namespace = '$i18n';
  }

  if (typeof options.i18n.filename !== 'string') {
    options.i18n.filename = '{{basename}}.{{lang}}.html';
  }

  if (typeof options.i18n.isLocalesRelativePath !== 'boolean') {
    options.i18n.isLocalesRelativePath = false;
  }

  const { i18n } = options;
  delete options.i18n;

  const stream = through.obj((file, enc, cb) => {
    if (file.isStream()) {
      this.emit(
        'error',
        new PluginError(PLUGIN_NAME, 'Streams are not supported'),
      );
      return cb();
    }

    let self = this;
    options.filename = file.path;

    let compile;
    try {
      compile = pug.compile(file.contents.toString(enc), options);
    } catch (e) {
      debug(`Error when compiling: ${file.path}`);
      this.emit('error', new PluginError(PLUGIN_NAME, e));
      return cb();
    }

    debug(`Process file: ${file.path}`);
    let localesPath = i18n.locales;
    if (i18n.isLocalesRelativePath) {
      localesPath = path.join(path.dirname(file.path), i18n.locales);
    }
    const locales = vfs.src(localesPath);
    const renders = [];

    // couldn't make it work with through.obj (used map instead)
    locales
      .pipe(
        map((locFile, lcb) => {
          const contents = locFile.contents.toString();

          let locObj = null;
          const locBase = path.basename(locFile.path);
          const locExt = path.extname(locFile.path);
          const locBaseNoExt = locBase.replace(locExt, '');
          debug(`Process locale: ${locBase}`);
          switch (locExt) {
            case '.yaml':
            case '.yml':
              locObj = yaml.load(contents);
              break;
            case '.js':
              locObj = require(locFile.path);
              break;
            case '.json':
            default:
              locObj = JSON.parse(contents);
              break;
          }

          if (i18n.namespace) {
            locObj = { [i18n.namespace]: locObj };
          }

          if (options.data) {
            locObj = Object.assign({}, options.data, locObj);
          }

          const render = compile(locObj);
          const filepath = makeFilename(
            file.path,
            locBaseNoExt,
            i18n.filename,
            i18n.default,
          );
          const basepath = path.basename(filepath);
          debug(`Output file: ${basepath}`);
          renders.push(
            new Vinyl({
              cwd: file.cwd,
              base: file.base,
              path: filepath,
              contents: new Buffer.from(render),
            }),
          );

          return lcb();
        }),
      )
      .on('end', () => {
        renders.forEach(f => self.push(f));
        cb();
      }); // locales pipe end
  }); // jade pipe end

  return stream;
}

module.exports = plugin;
