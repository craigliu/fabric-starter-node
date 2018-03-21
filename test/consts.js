const path = require('path');


const chaincodeId = 'mycc';
const chaincodeVersion = 'v1';
const channelName = 'mychannel';

const networkConfigPath = path.resolve(__dirname, './network/network.yaml');
const org1ConfigPath = path.resolve(__dirname, './network/org1.yaml');
const org2ConfigPath = path.resolve(__dirname, './network/org2.yaml');
const configTxPath = path.resolve(__dirname, './network/channel.tx');

module.exports = {
  chaincodeId,
  chaincodeVersion,
  channelName,

  networkConfigPath,
  org1ConfigPath,
  org2ConfigPath,
  configTxPath,
};
