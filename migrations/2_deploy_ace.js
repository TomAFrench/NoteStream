/* global artifacts */
const bn128 = require('@aztec/bn128');

const ACE = artifacts.require('./ACE.sol');

module.exports = async (deployer) => {
  await deployer.deploy(ACE);

  const ace = await ACE.at(ACE.address);
  await ace.setCommonReferenceString(bn128.CRS);
};
