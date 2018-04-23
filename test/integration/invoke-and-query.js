const FabService = require('../utils/fabric-service');
const test = require('../base');
const clientStore = require('./client-store.js');
const Consts = require('../consts.js');

const { identities } = Consts;

test('Invoke cc', async (t) => {
  const fab = new FabService({ clientStore, chaincodeId: Consts.chaincodeId });
  let res;
  res = await fab.invoke({
    org: 'org1',
    fcn: 'test',
    args: ['a', 'b'],
  }, identities.user1);
  console.log(res);

  res = await fab.query({
    org: 'org1',
    fcn: 'query',
    args: ['a'],
  }, identities.user1);


  t.pass('Successfully invoked');
  t.end();
});
