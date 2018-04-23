const logger = require('./logger.js').getLogger('FabricService');
const Consts = require('../consts');

logger.level = 'debug';

function transactionMonitor(eventHub, txId) {
  return new Promise((resolve, reject) => {
    const handler = setTimeout(() => {
      logger.error(`Timeout for receiving event for txId:${txId.getTransactionID()}`);
      eventHub.disconnect();
      throw new Error(`Timeout for receiving event for txId:${txId.getTransactionID()}`);
    }, 10000);

    eventHub.registerTxEvent(txId.getTransactionID(), (eventTxId, code, blockNum) => {
      clearTimeout(handler);
      resolve({ eventTxId, code, blockNum });
    }, (err) => {
      clearTimeout();
      reject(err);
    }, { disconnect: true });

    eventHub.connect();
  });
}

async function sendAndWaitOnEvents(channel, request) {
  const promises = [];
  promises.push(channel.sendTransaction(request));

  const channelEventHubs = channel.getChannelEventHubsForOrg();
  channelEventHubs.forEach((eh) => {
    const eventMonitor = transactionMonitor(eh, request.txId);
    promises.push(eventMonitor);
  });

  return Promise.all(promises);
}

class FabricService {
  constructor(options) {
    logger.debug('Constructor with options %j', options);
    const { clientStore } = options;
    this.clientStore = clientStore;
    this.channelName = Consts.channelName;
    this.chaincodeId = options.chaincodeId;
  }

  /**
   * @typedef {Object} Transaction
   * @property {string} org - Required
   * @property {Object} args - Optional
   */

  /**
   * Invoke Chaincode
   * @param {Transaction} tx
   * @param {User} identity
   * @return {Promise<any>}
   */
  async invoke(tx, identity) {
    try {
      FabricService.checkTx(tx);
      FabricService.checkIdentity(identity);

      const { org, args, fcn } = tx;
      const client = await this.clientStore.get(org, {
        configs: FabricService.getConfigForOrg(org),
        mutualTLS: {
          enrollmentID: identity.username,
          enrollmentSecret: identity.password,
        },
      });

      const user = await client.setUserContext(identity);
      logger.debug('use identity %s for this client', user.getName());
      const txId = client.newTransactionID();
      const channel = client.getChannel(this.channelName);

      // 1. send to endorser
      let request = {
        targets: FabricService.getTargetsForOrg(org),
        txId,
        chaincodeId: this.chaincodeId,
        fcn,
        args,
      };
      const [proposalResponses, proposal] = await channel.sendTransactionProposal(request);
      if (proposalResponses && proposalResponses[0].response
        && proposalResponses[0].response.status === 200) {
        logger.debug('Successfully send transaction proposal and get response from peer');
      } else {
        const msg = 'Failed to send invoke Proposal or receive invalid response';
        logger.error(msg);
        throw new Error(msg);
      }

      // 2. send to committer
      request = {
        proposalResponses,
        proposal,
        txId,
      };
      const responses = await sendAndWaitOnEvents(channel, request);
      if (!(responses[0] instanceof Error) && responses[0].status === 'SUCCESS') {
        logger.info(`Successfully committed transaction ${txId.getTransactionID()}`);
      } else {
        const msg = 'Failed to send ProposalResponse to committer';
        logger.error(msg);
        throw new Error(msg);
      }
      return responses;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Query Chaincode
   * @param {Transaction} tx
   * @param {User} identity
   * @return {Promise<any>}
   */
  async query(tx, identity) {
    try {
      FabricService.checkTx(tx);
      FabricService.checkIdentity(identity);

      const { org, args, fcn } = tx;
      const client = await this.clientStore.get(org, {
        configs: FabricService.getConfigForOrg(org),
        mutualTLS: {
          enrollmentID: identity.username,
          enrollmentSecret: identity.password,
        },
      });

      const user = await client.setUserContext(identity);
      logger.debug('use identity %s for this client', user.getName());
      const txId = client.newTransactionID();
      const channel = client.getChannel(this.channelName);

      const request = {
        targets: FabricService.getTargetsForOrg(org),
        chaincodeId: this.chaincodeId,
        fcn,
        args,
        txId,
      };
      const response = (await channel.queryByChaincode(request)).toString('utf8');
      logger.debug('Invoke response:\n    %s', response);
      return response;
    } catch (e) {
      throw e;
    }
  }

  static checkTx(tx) {
    if (!tx.org) {
      throw new Error('Missing Required Argument "tx.org"');
    }
    if (!tx.args) {
      throw new Error('Missing Required Argument "tx.args"');
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

  static getTargetsForOrg(org) {
    if (org === 'org1') {
      return 'peer0.org1.example.com';
    } else if (org === 'org2') {
      return 'peer0.org2.example.com';
    }
    throw new Error(`Only support org "org1" and "org2", found ${org}`);
  }
}

module.exports = FabricService;
