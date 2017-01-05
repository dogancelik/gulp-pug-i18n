var path = require('path');
var vfs = require('vinyl-fs');
var Vinyl = require('vinyl');
var assert = require('assert');
var map = require('map-stream');
var pug = require('../lib');

describe('Plugin', function () {
  it('works on 2 files with default locale', function (done) {
    var pugObj = {
      i18n: {
        locales: 'test/fixtures/locales/*.{yml,json}',
        filename: '{{basename}}{-{{lang}}}{-{{region}}}.html',
        default: 'en'
      }
    };

    const htmlEn = '<html><title>Example</title></html><body><h1>Hello World!</h1></body>';
    const htmlTr = '<html><title>Deneme</title></html><body><h1>Merhaba Dünya!</h1></body>';

    function check (file, cb) {
      var filename = path.basename(file.path);
      var contents = file.contents.toString();
      switch (filename) {
        case 'index.html':
          assert.equal(contents, htmlEn);
          break;
        case 'index-tr.html':
          assert.equal(contents, htmlTr);
          break;
        default:
          throw new Error(`Unexpected filename: ${filename}`);
          break;
      }
      cb(null, file);
    }

    vfs
      .src('test/fixtures/index*.{jade,pug}')
      .pipe(pug(pugObj))
      .pipe(map(check))
      .on('end', done)
  });

  it('works with data option', function (done) {
    var file = new Vinyl({
      path: 'test/fixtures/fake.pug',
      contents: new Buffer('h1= $i18n.title+"-"+hello')
    });

    var pugPipe = pug({
      i18n: {
        locales: 'test/fixtures/locales/en.yml'
      },
      data: {
        hello: 'world'
      }
    });

    pugPipe
      .once('data', function (file) {
        assert(file.isBuffer());
        assert.equal(file.contents.toString(), '<h1>Example-world</h1>');
        done();
      })
      .write(file);
  });
});
