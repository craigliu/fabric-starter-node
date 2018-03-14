const requireDir = require('require-dir');
const gulp = require('gulp');


// Require all tasks in gulp/tasks, including subfolders
requireDir('./build', { recurse: true });


gulp.task('default', ['lint'], () => {
  // This will only run if the lint task is successful...
});
