# Hyperledger Fabric Starter for node.js chaincodes
[![NPM](https://nodei.co/npm/fabric-client.svg?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/fabric-fabric-client/)
[![NPM](https://nodei.co/npm/fabric-ca-client.svg?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/fabric-fabric-ca-client/)

This project is a starter for fabric node.js chaincodes development.
As an application developer, to learn about how to implement **"Smart Contracts"** for the Hyperledger Fabric using Node.js, Please visit the [documentation](https://fabric-shim.github.io/).

This project setup the utils for fabric node.js chaincodes development.

## Pre-request

Pre-requisites:
* node engine: LTS (8.9.0 or later, up to but not including 9.0.0)
* npm: 5.5.1 or later (usually comes with node install)
* gulp: must be globally installed in order to use the "gulp" command, `sudo npm install -g gulp`

Pull hyperledger/fabric-x86_64-xxx images by
```
gulp pull-images
```
