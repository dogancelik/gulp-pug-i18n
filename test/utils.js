var assert = require('assert');
var utils = require('../lib/utils');

describe('Parsing locales', function () {
  it('with language', function () {
    var locale = utils.parseLocaleName('en');
    assert.equal(locale.lang, 'en');
  });

  it('with language, region', function () {
    var locale = utils.parseLocaleName('en_GB');
    assert.equal(locale.lang, 'en');
    assert.equal(locale.region, 'GB');
  });

  it('with language, region, script', function () {
    var locale = utils.parseLocaleName('zh-Hans_HK');
    assert.equal(locale.lang, 'zh');
    assert.equal(locale.region, 'HK');
    assert.equal(locale.script, 'Hans');
  });

  it('with language, script', function () {
    var locale = utils.parseLocaleName('mn-Mong');
    assert.equal(locale.lang, 'mn');
    assert.equal(locale.script, 'Mong');
  });
});

describe('Generating filenames', function () {
  function gen (locale, pattern, localeDef, cb) {
    var is = `using locale “${locale}” and filename pattern “${pattern}”` +
      (localeDef != null ? ` with default locale as “${localeDef}”` : '');
    it(is, () => cb(utils.makeFilename('index.html', locale, pattern, localeDef)));
  }

  gen('en-US', '{{basename}}.{{lang}}.html', null,
    (filename) => assert.equal(filename, 'index.en.html'));

  gen('tr-TR', '{{basename}}.{{lang}}.{{region}}.html', null,
    (filename) => assert.equal(filename, 'index.tr.TR.html'));

  gen('en-US', '{{basename}}{.{{lang}}}.html', 'en-US',
    (filename) => assert.equal(filename, 'index.html'));
});
