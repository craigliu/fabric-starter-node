const gulp = require('gulp');
const shell = require('gulp-shell');
const istanbul = require('gulp-istanbul');
const tape = require('gulp-tape');
const tapColorize = require('tap-colorize');

const shellConfig = {
  verbose: true, // so we can see the docker command output
  ignoreErrors: true, // kill and rm may fail because the containers may have been cleaned up
};

gulp.task('docker-clean', shell.task([
  // stop and remove chaincode docker instances
  'docker kill $(docker ps | grep "dev-peer0.org1.example.com-mycc" | awk \'{print $1}\')',
  'docker rm $(docker ps -a | grep "dev-peer0.org1.example.com-mycc" | awk \'{print $1}\')',

  // remove chaincode images so that they get rebuilt during test
  'docker rmi $(docker images | grep "^dev-peer0.org1.example.com-mycc" | awk \'{print $3}\')',

  // clean up all the containers created by docker-compose
  'docker-compose -f test/network/docker-compose.yml down',
], shellConfig));

gulp.task('docker-ready', ['docker-clean'], shell.task([
  'docker-compose -f test/network/docker-compose.yml up -d',
], shellConfig));

gulp.task('pre-test', () => gulp.src([
  'chaincode/**/*.js',
]).pipe(istanbul())
  .pipe(istanbul.hookRequire()));

// gulp.task('test', ['lint', 'pre-test', 'docker-ready'], () => gulp.src([
gulp.task('test', ['pre-test', 'docker-ready'], () => gulp.src([
  // all unit test
  'test/unit/**/*.js',
  // all integration test
  'test/integration/e2e.js',
  // add more test here
]).pipe(tape({ reporter: tapColorize() }))
  .pipe(istanbul.writeReports({
    reporters: ['lcov', 'json', 'text', 'text-summary', 'cobertura'],
  })));

gulp.task('unit-test', ['clean-up', 'lint', 'pre-test'], () => gulp.src([
  // all unit test
  'test/unit/**/*.js',
]).pipe(tape({ reporter: tapColorize() }))
  .pipe(istanbul.writeReports({
    reporters: ['lcov', 'json', 'text', 'text-summary', 'cobertura'],
  })));
