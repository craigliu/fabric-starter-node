const Consts = require('../consts');
const fs = require('fs');
const test = require('../base.js');
const ClientStore = require('./client-store.js');
const logger = require('../utils/logger').getLogger('create-channel');

logger.level = 'debug';

test('Create Channel', async (t) => {
  try {
    const signatures = [];
    const configOrg1 = [Consts.networkConfigPath, Consts.org1ConfigPath];
    const configOrg2 = [Consts.networkConfigPath, Consts.org2ConfigPath];
    const client1 = await ClientStore.get('org1', {
      configs: configOrg1,
      mutualTLS: Consts.identities.admin1,
    });

    // get the config envelope created by the configtx tool
    const envelopeBytes = fs.readFileSync(Consts.configTxPath);
    const config = client1.extractChannelConfig(envelopeBytes);

    let signature = client1.signChannelConfig(config);
    signatures.push(signature);

    const client2 = await ClientStore.get('org2', {
      configs: configOrg2,
      mutualTLS: Consts.identities.admin2,
    });
    signature = client2.signChannelConfig(config);
    signatures.push(signature);
    const req = {
      config,
      signatures,
      name: Consts.channelName,
      txId: client2.newTransactionID(true),
      orderer: 'orderer.example.com',
    };
    const resp = await client2.createChannel(req);
    logger.debug(resp);
    if (resp.status && resp.status === 'SUCCESS') {
      logger.debug('Wait for 10 seconds to ensure the channel has been created successfully');
      await Consts.sleep(10000);
      t.pass('Successfully Created Channel');
    } else {
      t.fail('Failed to create the channel. ');
      throw new Error('Failed to create the channel');
    }
  } catch (e) {
    logger.error(e);
    t.fail(e.message);
    t.end();
  }
});
