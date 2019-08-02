/* global artifacts */
const ACE = artifacts.require('./ACE.sol');
const JoinSplitFluid = artifacts.require('./JoinSplitFluid.sol');
const Swap = artifacts.require('./Swap.sol');
const Dividend = artifacts.require('./Dividend.sol');
const PrivateRange = artifacts.require('./PrivateRange.sol');
const JoinSplit = artifacts.require('./JoinSplit.sol');

const utils = require('@aztec/dev-utils');

const {
  constants,
  proofs: {
    JOIN_SPLIT_PROOF,
    MINT_PROOF,
    SWAP_PROOF,
    DIVIDEND_PROOF,
    PRIVATE_RANGE_PROOF,
  },
} = utils;


module.exports = async (deployer, network) => {
  if (network === 'development') {
    await deployer.deploy(ACE);
    await deployer.deploy(JoinSplitFluid);
    await deployer.deploy(Swap);
    await deployer.deploy(JoinSplit);
    await deployer.deploy(PrivateRange);

    await deployer.deploy(Dividend);
    const ACEContract = await ACE.deployed(constants.CRS);
    const JoinSplitFluidContract = await JoinSplitFluid.deployed();
    await ACEContract.setCommonReferenceString(constants.CRS);
    await ACEContract.setProof(MINT_PROOF, JoinSplitFluidContract.address);
    await ACEContract.setProof(SWAP_PROOF, Swap.address);
    await ACEContract.setProof(DIVIDEND_PROOF, Dividend.address);
    await ACEContract.setProof(JOIN_SPLIT_PROOF, JoinSplit.address);
    await ACEContract.setProof(PRIVATE_RANGE_PROOF, PrivateRange.address);
  }
};
