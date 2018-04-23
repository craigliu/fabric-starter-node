/* eslint-disable class-methods-use-this */
const shim = require('fabric-shim');

const logger = shim.newLogger('sample-cc');

const Chaincode = class {
  async Init(stub) {
    logger.info('########### example_cc0 Init ###########');
    const ret = stub.getFunctionAndParameters();

    let A;
    let B; // Entities
    let Aval;
    let Bval; // Asset holdings
    const args = ret.params;

    if (args.length === 4) {
      [A, Aval, B, Bval] = args;

      Aval = parseInt(Aval, 10);
      if (Number.isNaN(Aval)) {
        return shim.error(Buffer.from('Expecting integer value for asset holding'));
      }
      Bval = parseInt(Bval, 10);
      if (Number.isNaN(Bval)) {
        return shim.error(Buffer.from('Expecting integer value for asset holding'));
      }

      logger.info(`Aval = ${Aval}, Bval = ${Bval}`);

      try {
        // Write the state to the ledger
        await stub.putState(A, Buffer.from(Aval.toString()));
        await stub.putState(B, Buffer.from(Bval.toString()));
        return shim.success();
      } catch (e) {
        return shim.error(e);
      }
    } else {
      return shim.error('init expects 4 args');
    }
  }

  async Invoke(stub) {
    logger.info('########### example_cc0 Invoke ###########');
    const ret = stub.getFunctionAndParameters();
    const { fcn, params: args } = ret;

    if (fcn === 'delete') {
      return this.delete(stub, args);
    }

    if (fcn === 'query') {
      return this.query(stub, args);
    }

    if (fcn === 'move') {
      return this.move(stub, args);
    }

    logger.Errorf(`Unknown action, check the first argument, must be one of 'delete', 'query', or 'move'. But got: ${fcn}`);
    return shim.error(`Unknown action, check the first argument, must be one of 'delete', 'query', or 'move'. But got: ${fcn}`);
  }

  async move(stub, args) {
    let Aval;
    let Bval; // Asset holdings

    if (args.length !== 3) {
      return shim.error('Incorrect number of arguments. Expecting 4, function followed by 2 names and 1 value');
    }

    const [A, B] = args;

    try {
      const Avalbytes = await stub.getState(A);
      if (!Avalbytes) {
        return shim.error('Entity A not found');
      }
      Aval = Avalbytes.toString();
      Aval = parseInt(Aval, 10);
    } catch (e) {
      return shim.error('Failed to get state A');
    }

    try {
      const Bvalbytes = await stub.getState(B);
      if (!Bvalbytes) {
        return shim.error('Entity B not found');
      }
      Bval = Bvalbytes.toString();
      Bval = parseInt(Bval, 10);
    } catch (e) {
      return shim.error('Failed to get state B');
    }
    // Perform the execution
    const X = parseInt(args[2], 10);
    if (Number.isNaN(X)) {
      return shim.error('Invalid transaction amount, expecting a integer value');
    }

    Aval -= X;
    Bval += X;
    logger.info(`Aval = ${Aval}, Bval = ${Bval}`);
    // Write the state back to the ledger
    try {
      await stub.putState(A, Buffer.from(Aval.toString()));
      await stub.putState(B, Buffer.from(Bval.toString()));
      return shim.success(Buffer.from('move succeed'));
    } catch (e) {
      return shim.error(e);
    }
  }

  async delete(stub, args) {
    if (args.length !== 1) {
      return shim.error('Incorrect number of arguments. Expecting 1');
    }

    const A = args[0];

    try {
      await stub.deleteState(A);
    } catch (e) {
      return shim.error('Failed to delete state');
    }

    return shim.success();
  }

  async query(stub, args) {
    if (args.length !== 1) {
      return shim.error('Incorrect number of arguments. Expecting name of the person to query');
    }

    const A = args[0];
    let Aval;
    // Get the state from the ledger
    try {
      const Avalbytes = await stub.getState(A);
      if (!Avalbytes) {
        return shim.error('Entity A not found');
      }
      Aval = Avalbytes.toString();
    } catch (e) {
      return shim.error('Failed to get state A');
    }

    const jsonResp = {
      Name: A,
      Amount: Aval,
    };
    logger.info('Query Response:%s\n', JSON.stringify(jsonResp));

    return shim.success(Buffer.from(Aval.toString()));
  }
};

shim.start(new Chaincode());
