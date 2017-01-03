var path = require('path');

var localeRegex = /([a-z]{2,3})([-_]([A-Z]{1}[a-z]{3}))?([-_]([A-Z]{2}))?(_([a-zA-Z]+))?/;
var optVar = /\{([^\}]+)\}/g;
var emptyVar = '!empty!';
var defaultVar = '!default!';

/**
 * @desc Parse locale identifiers
 */
function parseLocaleName (name) {
  var obj = {};
  var match = name.match(localeRegex);

  if (match === null) return false;

  obj.locale = name;
  obj.lang = match[1] ? match[1] : null;
  obj.script = match[3] ? match[3] : null;
  obj.region = match[5] ? match[5] : null;
  obj.sort = match[7] ? match[7] : null;

  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    obj[key + '_lower'] = obj[key] ? obj[key].toLowerCase() : null;
    obj[key + '_upper'] = obj[key] ? obj[key].toUpperCase() : null;
  }

  return obj;
}

/**
 * @desc Helper method for editing object properties
 */
function loopObject (obj, cb) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      cb(key, obj[key]);
    }
  }
}

/**
 * @desc Prepare locale object for pattern/filename making
 */
function prepareLocale (locObj) {
  loopObject(locObj, (key, val) => locObj[key] = val === null ? emptyVar : val);
  return locObj;
}

/**
 * @desc Pattern parsing logic for generating a new filename
 * @summary Creating a new filename based on provided locale and pattern
 */
function parsePattern (pattern, localeConfig, filepath, defaultLoc) {
  var fileVariables = {};
  var parsed = path.parse(filepath);
  fileVariables.basename = parsed.name;
  fileVariables.origname = parsed.base;
  fileVariables.origext = parsed.ext;

  var filename = filepath.replace(fileVariables.origname, pattern);
  loopObject(fileVariables, (key, val) => filename = filename.replace(`{{${key}}}`, val));
  loopObject(localeConfig, (key, val) =>
    filename = filename.replace(`{{${key}}}`, val + (localeConfig.locale === defaultLoc ? defaultVar : ''))
  );

  filename = filename
    .replace(optVar, (match, g1) => g1.includes(emptyVar) || g1.includes(defaultVar) ? '' : g1)
    .replace(new RegExp(emptyVar, 'g'), '')
    .replace(new RegExp(defaultVar, 'g'), '');
  return filename;
}

/**
 * @desc Helper method to generate a new filename
 */
function makeFilename (filepath, locBase, pattern, defaultLoc) {
  var localeConfig = parseLocaleName(locBase);
  localeConfig = prepareLocale(localeConfig);
  var newFilepath = parsePattern(pattern, localeConfig, filepath, defaultLoc);
  return newFilepath;
}

exports.parseLocaleName = parseLocaleName;
exports.makeFilename = makeFilename;
