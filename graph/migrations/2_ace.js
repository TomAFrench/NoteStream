/* global artifacts */
const devUtils = require('@aztec/dev-utils');
const ACE = artifacts.require('@aztec/protocol/contracts/ACE/ACE.sol');
const JoinSplit = artifacts.require('@aztec/protocol/contracts/ACE/validators/joinSplit/JoinSplit.sol');
const JoinSplitFluid = artifacts.require('@aztec/protocol/contracts/ACE/validators/joinSplit/JoinSplit.sol');

const {
    JOIN_SPLIT_PROOF,
    MINT_PROOF,
} = devUtils.proofs;

const CRS = [
    '0x10f7463e3bdb09c66bcc67cbd978bb8a2fd8883782d177aefc6d155391b1d1b8',
    '0x12c4f960e11ba5bf0184d3433a98127e90a6fdb2d1f12cdb369a5d3870866627',
    '0x01cf7cc93bfbf7b2c5f04a3bc9cb8b72bbcf2defcabdceb09860c493bdf1588d',
    '0x08d554bf59102bbb961ba81107ec71785ef9ce6638e5332b6c1a58b87447d181',
    '0x204e5d81d86c561f9344ad5f122a625f259996b065b80cbbe74a9ad97b6d7cc2',
    '0x02cb2a424885c9e412b94c40905b359e3043275cd29f5b557f008cd0a3e0c0dc',
];

module.exports = async (deployer) => {
    const ACEContract = await deployer.deploy(ACE);
    await deployer.deploy(JoinSplit);
    await deployer.deploy(JoinSplitFluid);

    await ACEContract.setCommonReferenceString(CRS);
    await ACEContract.setProof(JOIN_SPLIT_PROOF, JoinSplit.address);
    await ACEContract.setProof(MINT_PROOF, JoinSplitFluid.address);
};
