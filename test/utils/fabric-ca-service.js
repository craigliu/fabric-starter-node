const Client = require('fabric-client');
const Consts = require('../consts');

class FabricService {
  constructor(config) {
    Client.loadFromConfig(config);
  }
}

module.exports = FabricService;
