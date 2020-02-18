/* global artifacts */
const { proofs } = require('@aztec/dev-utils');

const ACE = artifacts.require('./ACE.sol');
const PrivateRange = artifacts.require('./PrivateRange.sol');
const PrivateRangeInterface = artifacts.require('./PrivateRangeInterface.sol');

PrivateRange.abi = PrivateRangeInterface.abi;

module.exports = async (deployer) => {
  await deployer.deploy(PrivateRange);

  const ace = await ACE.at(ACE.address);
  await ace.setProof(proofs.PRIVATE_RANGE_PROOF, PrivateRange.address);
};
