// This file applies airbnb eslint rule for this starter project
// Deatils can be found at https://github.com/airbnb/javascript

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const path = require('path');

gulp.task('lint', () => gulp.src([
  '**/*.js',
  '!src/node_modules/**',
  '!test/node_modules/**',
  '!coverage/**',
  '!docs/**',
], {
  base: path.join(__dirname, '..'),
}).pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));
