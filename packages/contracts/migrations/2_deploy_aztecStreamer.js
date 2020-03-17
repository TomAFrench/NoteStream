/* global artifacts */
/* eslint-disable no-console */
const { isUndefined } = require('lodash');
const argv = require('minimist')(process.argv.slice(2), {string: ['AceAddress']});

const AztecStreamer = artifacts.require('AztecStreamer.sol');
const AceAddress = argv['AceAddress'];

module.exports = async (deployer) => {
  if (isUndefined(AceAddress)) {
    console.log('ACE contract address (--AceAddress) parameter is missing');
    process.exit(1);
  }
  const aztecStreamer = await AztecStreamer.new(AceAddress);
  AztecStreamer.setAsDeployed(aztecStreamer);
};
