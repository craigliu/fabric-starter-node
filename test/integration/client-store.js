const Client = require('fabric-client');
const logger = require('../utils/logger').getLogger('client-store');

logger.level = 'info';

async function newClient({ configs, mutualTLS }) {
  try {
    let profile = configs;
    if (configs && !Array.isArray(configs)) {
      profile = [configs];
    }
    if (!profile) {
      throw new Error('Must provide config filepath for this client');
    }
    logger.debug('Start to load config');
    const client = Client.loadFromConfig(profile[0]);
    logger.debug('load config %s', profile[0]);
    if (profile.length > 1) {
      profile.forEach((p, k) => {
        if (k !== 0) {
          client.loadFromConfig(p);
          logger.debug('load config %s', p);
        }
      });
    }
    await client.initCredentialStores();
    logger.debug('Successully created key/value store and crypto store');

    if (mutualTLS) {
      const ca = client.getCertificateAuthority();
      const enrollment = await ca.enroll({
        enrollmentID: mutualTLS.enrollmentID,
        enrollmentSecret: mutualTLS.enrollmentSecret,
        profile: 'tls',
      });
      logger.debug('Successfully enrolled %s', mutualTLS.enrollmentID);
      client.setTlsClientCertAndKey(enrollment.certificate, enrollment.key.toBytes());
    }
    return client;
  } catch (e) {
    throw e;
  }
}

class ClientStore {
  /**
   * @typedef {object} mutualTLSOptions
   * @property {string} enrollmentID - the enrollmentID for this mutualTLS
   * @property {string} enrollmentSecret - the enrollmentSecret for this mutualTLS
   */

  /**
   * @typedef {object} CreateClientOption
   * @property {string[]} configs - the config file path array
   * @property {mutualTLSOptions} mutualTLS - use mutualTLS,
   *                                   and the enrollmentID/enrollmentSecret for this mutualTLS
   */

  /**
   * @param {string} orgName - the orgName of this client
   * @param {CreateClientOption} options - options for create new Client instance
   * @return {Promise<Client>}
   */
  static async get(orgName, options) {
    try {
      if (!this.clients) {
        logger.debug('no clients found, create new clients store');
        this.clients = {};
      }
      if (typeof orgName !== 'string' || !orgName) {
        throw new Error('Missing required argument orgName');
      }
      if (this.clients[orgName]) {
        logger.info('found client %s from cache', orgName);
        return this.clients[orgName];
      }
      logger.info('can not found client %s from cache, create new client instance', orgName);
      logger.debug('create new client with options :: %j', options);
      if (!options) {
        throw new Error('Can not found client from cache, try to create new Client instance, missing required argument options');
      }
      const client = await newClient(options);
      this.clients[orgName] = client;
      return client;
    } catch (e) {
      throw e;
    }
  }
}

module.exports = ClientStore;
