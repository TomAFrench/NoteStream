/* global artifacts */
/* eslint-disable no-console */
const {
  constants: { ERC20_SCALING_FACTOR },
} = require('@aztec/dev-utils');
const { isUndefined } = require('lodash');

const ACE = artifacts.require('./ACE.sol');
const ERC20Mintable = artifacts.require('./ERC20Mintable.sol');
const ZkAssetAdjustable = artifacts.require('./ZkAssetAdjustable.sol');

module.exports = async (deployer) => {
  if (isUndefined(ACE) || isUndefined(ACE.address)) {
    console.log('Please deploy the ACE contract first');
    process.exit(1);
  }

  await deployer.deploy(ERC20Mintable);

  await deployer.deploy(
    ZkAssetAdjustable,
    ACE.address,
    ERC20Mintable.address,
    ERC20_SCALING_FACTOR,
    0,
    [],
  );
};
