'use strict';

const gulp = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const objectFitImages = require('postcss-object-fit-images');
const browserSync = require('browser-sync').create();
const ghPages = require('gulp-gh-pages');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const cleanCSS = require('gulp-cleancss');
const wait = require('gulp-wait');

let postCssPlugins = [
  autoprefixer({
    browsers: ['last 2 version'],
    grid: true,
  }),
  mqpacker({
    sort: true
  }),
  objectFitImages(),
];

gulp.task('style', function () {
  return gulp.src('./scss/style.scss')
    .pipe(plumber({
      errorHandler: function(err) {
        notify.onError({
          title: 'Styles compilation error',
          message: err.message
        })(err);
        this.emit('end');
      }
    }))
    .pipe(wait(100))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss(postCssPlugins))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest('./css/'))
    .pipe(browserSync.stream({match: '**/*.css'}))
    .pipe(rename('style.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./css/'));
});

gulp.task('default', ['serve']);

gulp.task('serve', ['style'], function() {
  browserSync.init({
    server: './',
    startPath: 'index.html',
    port: 8080,
    open: false
  });

  gulp.watch([
    './scss/**/*.scss',
  ], ['style']);

  gulp.watch([
    './*.html',
  ], ['watch:html']);

});

gulp.task('watch:html', [], reload);

gulp.task('deploy', function() {
  return gulp.src([
      '**/*',
      '!node_modules/**',
      '!scss/**',
      '!gulpfile.js',
      '!package-lock.json',
      '!package.json',
      '!readme.md',
    ])
    .pipe(ghPages());
});

function reload (done) {
  browserSync.reload();
  done();
}

var onError = function(err) {
  notify.onError({
    title: 'Error in ' + err.plugin,
  })(err);
  this.emit('end');
};
