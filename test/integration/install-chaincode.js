const test = require('../base.js');
const Consts = require('../consts.js');
const logger = require('../utils/logger').getLogger('install-chaincode');
const ClientStore = require('./client-store.js');

logger.level = 'debug';

test('Install Chaincode', async (t) => {
  try {
    const configOrg1 = [Consts.networkConfigPath, Consts.org1ConfigPath];
    const configOrg2 = [Consts.networkConfigPath, Consts.org2ConfigPath];
    const client1 = await ClientStore.get('org1', {
      configs: configOrg1,
      mutualTLS: Consts.identities.admin1,
    });

    const request = {
      txId: client1.newTransactionID(true),
      chaincodeId: Consts.chaincodeId,
      chaincodeType: 'node',
      chaincodePath: Consts.chaincodePath,
      chaincodeVersion: Consts.chaincodeVersion,
      channelNames: Consts.channelName,
    };
    let resp = await client1.installChaincode(request);
    logger.debug('Org1 install chaincode response :: %j', resp[0]);
    if (resp && resp[0] && resp[0][0].response && resp[0][0].response.status === 200) {
      t.pass('Org1 install chaincode success');
    } else {
      t.fail('Org1 install chaincode failed');
      t.end();
    }

    const client2 = await ClientStore.get('org2', {
      configs: configOrg2,
      mutualTLS: Consts.identities.admin2,
    });
    request.txId = client2.newTransactionID(true);
    resp = await client2.installChaincode(request);
    logger.debug('Org2 install chaincode response :: %j', resp[0]);
    if (resp && resp[0] && resp[0][0].response && resp[0][0].response.status === 200) {
      t.pass('Org2 install chaincode success');
    } else {
      t.fail('Org1 install chaincode failed');
      t.end();
    }
  } catch (e) {
    t.fail(e);
    t.end();
  }
});
