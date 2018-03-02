const gulp = require('gulp');
const shell = require('gulp-shell');
const util = require('util');
const fs = require('fs');
const path = require('path');
const test = require('../../test/base');

const testDir = test.BasicNetworkTestDir;
gulp.task('docker-cli-ready', ['docker-clean'], () => gulp.src('*.js', { read: false })
  .pipe(shell([
    // make sure that necessary containers are up by docker-compose
    util.format('docker-compose -f %s up -d cli', fs.realpathSync(path.join(testDir, 'docker-compose.yml'))),
  ])));

gulp.task('generate-config', ['docker-cli-ready'], () => gulp.src('*.js', { read: false })
  .pipe(shell([
    util.format(
      'docker exec cli configtxgen -profile OneOrgOrdererGenesis -outputBlock %s',
      '/etc/hyperledger/configtx/genesis.block',
    ),
    util.format(
      'docker exec cli configtxgen -profile OneOrgChannel -outputCreateChannelTx %s -channelID mychannel',
      '/etc/hyperledger/configtx/channel.tx',
    ),
    'docker exec cli cp /etc/hyperledger/fabric/core.yaml /etc/hyperledger/config/',
  ], {
    verbose: true, // so we can see the docker command output
    ignoreErrors: true, // kill and rm may fail because the containers may have been cleaned up
  })));
