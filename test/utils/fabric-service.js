const logger = require('./logger.js').getLogger('FabricService');
const Consts = require('../consts');

class FabricService {
  constructor(options) {
    logger.debug('Constructor with options %j', options);
    const { clientStore } = options;
    this.clientStore = clientStore;
  }

  async invoke(tx, identity) {
    try {
      if (!tx) {
        throw new Error('Missing Required Argument "tx"');
      }
      if (!identity) {
        throw new Error('Missing Required Argument "identity"');
      }
      FabricService.checkTx(tx);
      FabricService.checkIdentity(identity);
      logger.debug('Invoke CC by tx: %j', tx);
      logger.debug('Invoke CC by identity: %j', identity);

      const { org, args } = tx;
      const client = await this.clientStore.get(org, {
        configs: FabricService.getConfigForOrg(org),
        mutualTLS: {
          enrollmentID: identity.username,
          enrollmentSecret: identity.password,
        },
      });

      logger.debug('Successfully get client for invoke, client: %j', client);
      const user = client.setUserContext(identity);
      console.log(user);

    } catch (e) {
      throw e;
    }
  }

  async query(tx, identity) {
    if (!tx) {
      throw new Error('Missing Required Argument "tx"');
    }
    if (!identity) {
      throw new Error('Missing Required Argument "identity"');
    }
  }

  static checkTx(tx) {
    if (!tx.org) {
      throw new Error('Missing Required Argument "tx.org"');
    }
  }

  static checkIdentity(identity) {
    if (!identity.username) {
      throw new Error('Missing Required Argument "identity.username"');
    }
    if (!identity.password) {
      throw new Error('Missing Required Argument "identity.password"');
    }
  }

  static getConfigForOrg(org) {
    const configOrg1 = [Consts.networkConfigPath, Consts.org1ConfigPath];
    const configOrg2 = [Consts.networkConfigPath, Consts.org2ConfigPath];
    if (org === 'org1') {
      return configOrg1;
    } else if (org === 'org2') {
      return configOrg2;
    }
    throw new Error(`Only support org "org1" and "org2", found ${org}`);
  }

  static getUserByName(name) {
    if (name === 'user1') {
      return Consts.identities.user1;
    } else if (name === 'user2') {
      return Consts.identities.user2;
    }
    throw new Error('Only support Name "user1" and "user2"');
  }
}

module.exports = FabricService;
