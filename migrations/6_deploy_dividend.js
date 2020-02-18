/* global artifacts */
const { proofs } = require('@aztec/dev-utils');

const ACE = artifacts.require('./ACE.sol');
const Dividend = artifacts.require('./Dividend.sol');
const DividendInterface = artifacts.require('./DividendInterface.sol');

Dividend.abi = DividendInterface.abi;

module.exports = async (deployer) => {
  await deployer.deploy(Dividend);

  const ace = await ACE.at(ACE.address);
  await ace.setProof(proofs.DIVIDEND_PROOF, Dividend.address);
};
