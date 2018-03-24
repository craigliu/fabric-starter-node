const shim = require('fabric-shim');

const logger = shim.newLogger('Chaincode');

const Chaincode = class {
  // eslint-disable-next-line class-methods-use-this
  async Init(stub) {
    const { fcn, params } = stub.getFunctionAndParameters();
    logger.debug('fcn %s, params %j', fcn, params);
    return shim.success(Buffer.from('Init Success'));
  }

  // eslint-disable-next-line class-methods-use-this
  async Invoke(stub) {
    const { fcn, params } = stub.getFunctionAndParameters();
    logger.debug('fcn %s, params %j', fcn, params);
    return shim.success(Buffer.from('Invoke Success'));
  }
};

shim.start(new Chaincode());
