/* global artifacts */
const { proofs } = require('@aztec/dev-utils');

const ACE = artifacts.require('./ACE.sol');
const JoinSplitFluid = artifacts.require('./JoinSplitFluid.sol');
const JoinSplitFluidInterface = artifacts.require('./JoinSplitFluidInterface.sol');

JoinSplitFluid.abi = JoinSplitFluidInterface.abi;

module.exports = async (deployer) => {
  await deployer.deploy(JoinSplitFluid);

  const ace = await ACE.at(ACE.address);
  const joinSplitFluidAddress = JoinSplitFluid.address;
  await ace.setProof(proofs.MINT_PROOF, joinSplitFluidAddress);
  await ace.setProof(proofs.BURN_PROOF, joinSplitFluidAddress);
};
