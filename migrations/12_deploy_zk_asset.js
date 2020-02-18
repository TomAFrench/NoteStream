/* global artifacts */
/* eslint-disable no-console */
const {
  constants: { addresses, ERC20_SCALING_FACTOR },
} = require('@aztec/dev-utils');
const { isUndefined } = require('lodash');

const ACE = artifacts.require('./ACE.sol');
const ERC20Mintable = artifacts.require('./ERC20Mintable.sol');
const ZkAsset = artifacts.require('./ZkAsset.sol');

module.exports = async (deployer, network) => {
  if (isUndefined(ACE) || isUndefined(ACE.address)) {
    console.log('Please deploy the ACE contract first');
    process.exit(1);
  }

  let erc20Address;
  if (network === 'mainnet') {
    erc20Address = addresses.DAI_ADDRESS;
  } else {
    await deployer.deploy(ERC20Mintable);
    erc20Address = ERC20Mintable.address;
  }

  await deployer.deploy(ZkAsset, ACE.address, erc20Address, ERC20_SCALING_FACTOR);
};
