const Client = require('fabric-client');
const Consts = require('../consts');
const fs = require('fs');
const test = require('../base.js');

const logger = require('log4js').getLogger('create-channel');

logger.level = 'debug';

test('Create Channel', async (t) => {
  try {
    const signatures = [];
    const client = Client.loadFromConfig(Consts.networkConfigPath);
    logger.debug('Successfully loaded a connection profile');

    client.loadFromConfig(Consts.org1ConfigPath);
    logger.debug('Successfully loaded org1 client profile');

    await client.initCredentialStores();
    logger.debug('Successully created key/value store and crypto store');

    const ca = client.getCertificateAuthority();
    const enrollment = await ca.enroll({
      enrollmentID: 'admin',
      enrollmentSecret: 'adminpw',
      profile: 'tls',
    });
    logger.debug('Successfully enrolled admin');

    const key = enrollment.key.toBytes();
    const cert = enrollment.certificate;

    client.setTlsClientCertAndKey(cert, key);

    // get the config envelope created by the configtx tool
    const envelopeBytes = fs.readFileSync(Consts.configTxPath);
    const config = client.extractChannelConfig(envelopeBytes);

    let signature = client.signChannelConfig(config);
    signatures.push(signature);

    await client.loadFromConfig(Consts.org2ConfigPath);
    await client.initCredentialStores();
    signature = client.signChannelConfig(config);
    signatures.push(signature);
    const req = {
      config,
      signatures,
      name: Consts.channelName,
      txId: client.newTransactionID(true),
      orderer: 'orderer.example.com',
    };
    const resp = await client.createChannel(req);
    logger.debug(resp);
    if (resp.status && resp.status === 'SUCCESS') {
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
