const test = require('../base.js');
const Consts = require('../consts.js');
const logger = require('../utils/logger').getLogger('create-channel');
const ClientStore = require('./client-store.js');

logger.level = 'debug';

test('Join channel', async (t) => {
  try {
    const configOrg1 = [Consts.networkConfigPath, Consts.org1ConfigPath];
    const configOrg2 = [Consts.networkConfigPath, Consts.org2ConfigPath];
    const client1 = await ClientStore.get('org1', {
      configs: configOrg1,
      mutualTLS: Consts.identities.admin1,
    });

    // get channel, throw error if any error happened
    const channelFromClient1 = client1.getChannel(Consts.channelName, true);

    // get genesisBlock
    let txId = client1.newTransactionID(true);
    let request = { txId };
    const genesisBlock = await channelFromClient1.getGenesisBlock(request);
    t.pass('Successfully get getGenesisBlock from Orderer');

    // org1 Join Channel
    txId = client1.newTransactionID(true);
    request = {
      targets: ['peer0.org1.example.com'],
      txId,
      block: genesisBlock,
    };
    let resp = await channelFromClient1.joinChannel(request);
    logger.debug('org1 joinChannel response :: %j', resp);
    if (resp[0] && resp[0].response && resp[0].response.status === 200) {
      t.pass('org1 Successfully joined Channel');
    } else {
      t.fail('org1 failed to join channel');
      t.end();
    }

    // checkout to org2 identity
    const client2 = await ClientStore.get('org2', {
      configs: configOrg2,
      mutualTLS: Consts.identities.admin2,
    });
    // org2 Join Channel
    txId = client2.newTransactionID(true);
    request = {
      targets: ['peer0.org2.example.com'],
      txId,
      block: genesisBlock,
    };
    const channelFromClient2 = client2.getChannel(Consts.channelName, true);
    resp = await channelFromClient2.joinChannel(request);
    logger.debug('org2 joinChannel response :: %j', resp);
    if (resp[0] && resp[0].response && resp[0].response.status === 200) {
      t.pass('org1 Successfully joined Channel');
    } else {
      t.fail('org1 failed to join channel');
      t.end();
    }
  } catch (e) {
    t.fail(e.message);
    t.end();
  }
});
