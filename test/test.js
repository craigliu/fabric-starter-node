const Client = require('fabric-client');

let client = Client.loadFromConfig('test/network/network.yaml');

async function test() {
    try {
        await client.initCredentialStores();
        const admin = await client.setUserContext({username:'admin', password:'adminpw'});
        console.log(admin);
    } catch (e) {
        console.log(e);
        throw e;
    }

}

test();