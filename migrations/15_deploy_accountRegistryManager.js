/* global artifacts */
const dotenv = require('dotenv');
const { fundRecipient } = require('@openzeppelin/gsn-helpers');
const { toWei } = require('web3-utils');
const Web3 = require('web3');

dotenv.config();
const AccountRegistryManager = artifacts.require('./AccountRegistry/AccountRegistryManager.sol');
const AccountRegistryBehaviour = artifacts.require('./AccountRegistry/epochs/20200106/Behaviour20200106');
const ACE = artifacts.require('./ACE.sol');

const WEB3_PROVIDER_URL = 'http://127.0.0.1:8545';
const TRUSTED_GSN_SIGNER_ADDRESS = '0x6794d16143e537a51d6745D3ae6bc99502b4331C';
const LOCAL_TRUSTED_GSN_SIGNER_ADDRESS = '0x24b934a7d1dd72bd8645a4958b0ff46bd29a5845';

module.exports = async (deployer, network) => {
  const useLocal = network === 'development' || network === 'test';
  await deployer.deploy(
    AccountRegistryManager,
    AccountRegistryBehaviour.address,
    ACE.address,
    useLocal ? LOCAL_TRUSTED_GSN_SIGNER_ADDRESS : TRUSTED_GSN_SIGNER_ADDRESS,
  );

  const contract = await AccountRegistryManager.at(AccountRegistryManager.address);
  const proxyAddress = await contract.proxyAddress.call();
  const web3 = new Web3(WEB3_PROVIDER_URL);
  await fundRecipient(web3, {
    recipient: proxyAddress,
    amount: toWei('1'),
  });
};
