const shim = require('fabric-shim');


const Chaincode = class {
  // eslint-disable-next-line class-methods-use-this
  async Init() {
    return shim.success(Buffer.from('Init Success'));
  }

  // eslint-disable-next-line class-methods-use-this
  async Invoke() {
    return shim.success(Buffer.from('Invoke Success'));
  }
};

shim.start(Chaincode);
