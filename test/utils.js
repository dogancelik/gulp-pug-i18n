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
