const path = require('path');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const chaincodeId = 'mycc';
const chaincodeVersion = 'v1';
const chaincodePath = path.resolve(__dirname, '../src');

const channelName = 'mychannel';

const networkConfigPath = path.resolve(__dirname, './network/network.yaml');
const org1ConfigPath = path.resolve(__dirname, './network/org1.yaml');
const org2ConfigPath = path.resolve(__dirname, './network/org2.yaml');
const configTxPath = path.resolve(__dirname, './network/channel.tx');
const identities = {
  admin1: {
    username: 'admin1', password: 'admin1pw', enrollmentID: 'admin1', enrollmentSecret: 'admin1pw',
  },
  admin2: {
    username: 'admin2', password: 'admin2pw', enrollmentID: 'admin2', enrollmentSecret: 'admin2pw',
  },
  user1: {
    username: 'user1', password: 'userpw', enrollmentID: 'user1', affiliation: 'org1', enrollmentSecret: 'userpw', maxEnrollments: 10,
  },
  user2: {
    username: 'user2', password: 'userpw', enrollmentID: 'user2', affiliation: 'org2', enrollmentSecret: 'userpw', maxEnrollments: 10,
  },
};
module.exports = {
  sleep,

  chaincodeId,
  chaincodeVersion,
  chaincodePath,

  channelName,

  networkConfigPath,
  org1ConfigPath,
  org2ConfigPath,
  configTxPath,

  identities,
};
