
const gulp = require('gulp');
const shell = require('gulp-shell');
const path = require('path');

// eslint-disable-next-line import/no-dynamic-require
const release = require(path.join(__dirname, '../package.json')).version;
const { arch } = process;
let dockerImageTag = '';
if (arch.indexOf('x64') === 0) {
  dockerImageTag = ':x86_64';
} else if (arch.indexOf('s390') === 0) {
  dockerImageTag = ':s390x';
} else if (arch.indexOf('ppc64') === 0) {
  dockerImageTag = ':ppc64le';
} else {
  throw new Error(`Unknow architecture: ${arch}`);
}
dockerImageTag += `-${release}`;

console.log(`Pull Docker Images with tag ${dockerImageTag}`);
process.env.DOCKER_IMG_TAG = dockerImageTag;

gulp.task('pull-images', shell.task([
  `docker pull hyperledger/fabric-peer${dockerImageTag}`,
  `docker pull hyperledger/fabric-orderer${dockerImageTag}`,
  `docker pull hyperledger/fabric-ccenv${dockerImageTag}`,
  `docker pull hyperledger/fabric-ca${dockerImageTag}`,
  `docker pull hyperledger/fabric-couchdb${dockerImageTag}`,
  'docker images',
]));
