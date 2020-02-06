/* global artifacts */
const { proofs } = require('@aztec/dev-utils');

const ACE = artifacts.require('./ACE.sol');
const JoinSplit = artifacts.require('./JoinSplit.sol');
const JoinSplitInterface = artifacts.require('./JoinSplitInterface.sol');

JoinSplit.abi = JoinSplitInterface.abi;

module.exports = async (deployer) => {
  await deployer.deploy(JoinSplit);

  const ace = await ACE.at(ACE.address);
  await ace.setProof(proofs.JOIN_SPLIT_PROOF, JoinSplit.address);
};
