const Client = require('fabric-client');
const Consts = require('../consts');
const fs = require('fs');
const path = require('path');

const logger = require('log4js').getLogger('create-channel');

logger.level = 'debug';

async function createChannel() {
  try {
    const signatures = [];
    const client = Client.loadFromConfig(Consts.networkConfigPath);
    console.log('Successfully loaded a connection profile');

    client.loadFromConfig(Consts.org1ConfigPath);
    console.log('Successfully loaded org1 client profile');

    await client.initCredentialStores();
    console.log('Successully created key/value store and crypto store');

    const ca = client.getCertificateAuthority();
    const enrollment = await ca.enroll({
      enrollmentID: 'admin',
      enrollmentSecret: 'adminpw',
      profile: 'tls',
    });
    console.log('Successfully enrolled admin');

    const key = enrollment.key.toBytes();
    const cert = enrollment.certificate;

    client.setTlsClientCertAndKey(cert, key);

    // get the config envelope created by the configtx tool
    const envelope_bytes = fs.readFileSync(Consts.configTxPath);
    const config = client.extractChannelConfig(envelope_bytes);

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
    let resp = await client.createChannel(req);
    console.log(resp);

  } catch (e) {
    logger.error(e);
  }
}

createChannel();
