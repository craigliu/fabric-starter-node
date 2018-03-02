#!/usr/bin/env bash
export FABRIC_CFG_PATH=$PWD
configtxgen -profile OrdererGenesis -outputBlock ./genesis.block
configtxgen -profile Channel -outputCreateChannelTx ./channel.tx -channelID mychannel