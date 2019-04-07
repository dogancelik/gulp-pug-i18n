var gulp = require('gulp');
var pug = require('./lib');
var map = require('map-stream');
var through = require('through2');
var vfs = require('vinyl-fs');

var srcPath = 'test/fixtures/*.{jade,pug}';
var locPath = 'test/fixtures/locales/*.{yml,json}';
var destPath = 'temp';

gulp.task('default', function () {
  return gulp
    .src(srcPath)
    .pipe(pug({ i18n: {
      locales: locPath,
      filename: '{{basename}}{-{{lang}}}{-{{region}}}.html',
      default: 'en'
    } }))
    .pipe(gulp.dest(destPath))
});
