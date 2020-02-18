/* global artifacts */
const { proofs } = require('@aztec/dev-utils');

const ACE = artifacts.require('./ACE.sol');
const Swap = artifacts.require('./Swap.sol');
const SwapInterface = artifacts.require('./SwapInterface.sol');

Swap.abi = SwapInterface.abi;

module.exports = async (deployer) => {
  await deployer.deploy(Swap);

  const ace = await ACE.at(ACE.address);
  await ace.setProof(proofs.SWAP_PROOF, Swap.address);
};
