var PLUGIN_NAME = 'gulp-pug-i18n';
var debug = require('debug')(PLUGIN_NAME);
var path = require('path');
var through = require('through2');
var { PluginError, File } = require('gulp-util');
var yaml = require('js-yaml');
var pug = require('pug');
var map = require('map-stream');
var vfs = require('vinyl-fs');
var { makeFilename } = require('./utils');

function plugin (options) {

  if (typeof options !== 'object') {
    throw new PluginError(PLUGIN_NAME, 'Initialization parameter must be an object');
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

  var i18n = options.i18n;
  delete options.i18n;

  var stream = through.obj(function (file, enc, cb) {

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported'))
      return cb();
    }

    var self = this;
    options.filename = file.path;
    var compile = pug.compile(file.contents.toString(enc), options);

    debug('Process file: ' + file.path);
    var locales = vfs.src(i18n.locales);
    var renders = [];

    // couldn't make it work with through.obj (used map instead)
    locales.pipe(map(function (locFile, lcb) {
      var contents = locFile.contents.toString();

      var locObj = null;
      var locBase = path.basename(locFile.path);
      var locExt = path.extname(locFile.path);
      var locBaseNoExt = locBase.replace(locExt, '');
      debug('Process locale: ' + locBase);
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
        locObj = Object.assign({}, options.data, locObj)
      }

      var render = compile(locObj);
      var filepath = makeFilename(file.path, locBaseNoExt, i18n.filename, i18n.default);
      var basepath = path.basename(filepath);
      debug('Output file: ' + basepath);
      renders.push(new File({
        cwd: file.cwd,
        base: file.base,
        path: filepath,
        contents: new Buffer(render)
      }));

      return lcb();
    }))
    .on('end', function() {
      renders.forEach((f) => self.push(f));
      cb();
    }); // locales pipe end
  }); // jade pipe end

  return stream;
}

module.exports = plugin;
