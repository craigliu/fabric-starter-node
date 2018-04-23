const test = require('../base.js');
const Consts = require('../consts.js');
const logger = require('../utils/logger').getLogger('create-identity');
const ClientStore = require('./client-store.js');

logger.level = 'debug';

const { identities } = Consts;

test('Create Identity', async (t) => {
  try {
    const configOrg1 = [Consts.networkConfigPath, Consts.org1ConfigPath];

    const client1 = await ClientStore.get('org1', {
      configs: configOrg1,
      mutualTLS: identities.admin1,
    });

    const admin1 = await client1.setUserContext(identities.admin1);
    t.pass('Successfully enrolled admin for org1');
    const ca1 = await client1.getCertificateAuthority().newIdentityService();
    t.pass('Successfully get ca for org1');
    const { user1 } = identities;
    await ca1.create({
      enrollmentID: user1.enrollmentID,
      affiliation: user1.affiliation,
      enrollmentSecret: user1.enrollmentSecret,
    }, admin1);
    t.pass('Successfully registered identity user1');

    t.end();
  } catch (e) {
    t.fail(e);
    t.end();
  }
});
