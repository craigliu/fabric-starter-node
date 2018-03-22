const test = require('../base.js');
const Consts = require('../consts.js');
const logger = require('log4js').getLogger('create-channel');
const Client = require('fabric-client');

logger.level = 'debug';

test('Join channel', async (t) => {
  try {
    const client = Client.loadFromConfig(Consts.networkConfigPath);
    client.loadFromConfig(Consts.org1ConfigPath);
    await client.initCredentialStores();
    let ca = client.getCertificateAuthority();
    let enrollment = await ca.enroll({
      enrollmentID: 'admin',
      enrollmentSecret: 'adminpw',
      profile: 'tls',
    });
    logger.debug('Successfully enrolled admin');

    let key = enrollment.key.toBytes();
    let cert = enrollment.certificate;
    client.setTlsClientCertAndKey(cert, key);

    // get channel, throw error if any error happened
    const channel = client.getChannel(Consts.channelName, true);

    // get genesisBlock
    let txId = client.newTransactionID(true);
    let request = { txId };
    const genesisBlock = await channel.getGenesisBlock(request);
    t.pass('Successfully get getGenesisBlock from Orderer');

    // org1 Join Channel
    txId = client.newTransactionID(true);
    request = {
      targets: ['peer0.org1.example.com'],
      txId,
      block: genesisBlock,
    };
    let resp = await channel.joinChannel(request);
    logger.debug('org1 joinChannel response :: %j', resp);
    if (resp[0] && resp[0].response && resp[0].response.status === 200) {
      t.pass('org1 Successfully joined Channel');
    } else {
      t.fail('org1 failed to join channel');
      t.end();
    }

    // checkout to org2 identity
    client.loadFromConfig(Consts.org2ConfigPath);
    await client.initCredentialStores();
    ca = client.getCertificateAuthority();
    enrollment = await ca.enroll({
      enrollmentID: 'admin',
      enrollmentSecret: 'adminpw',
      profile: 'tls',
    });
    logger.debug('Successfully enrolled admin');
    key = enrollment.key.toBytes();
    cert = enrollment.certificate;
    client.setTlsClientCertAndKey(cert, key);
    // org2 Join Channel
    txId = client.newTransactionID(true);
    request = {
      targets: ['peer0.org2.example.com'],
      txId,
      block: genesisBlock,
    };
    resp = await channel.joinChannel(request);
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
