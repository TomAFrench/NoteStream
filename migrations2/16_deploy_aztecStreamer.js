/* global artifacts */
/* eslint-disable no-console */
const { isUndefined } = require('lodash');

const AztecStreamer = artifacts.require('AztecStreamer.sol');
const ACE = artifacts.require('./ACE/ACE.sol');

module.exports = async (deployer) => {
  if (isUndefined(ACE) || isUndefined(ACE.address)) {
    console.log('Please deploy the ACE contract first');
    process.exit(1);
  }

  // await deployer.deploy(AztecStreamer, ACE.address);
};
