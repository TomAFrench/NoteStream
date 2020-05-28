const { ethers } = require('ethers');
const { deployContract } = require('ethereum-waffle');

const { JoinSplitProof } = require('aztec.js');
const bn128 = require('@aztec/bn128');
const { proofs } = require('@aztec/dev-utils');

const { JOIN_SPLIT_PROOF, DIVIDEND_PROOF } = proofs;

const {
    ACE,
    FactoryBase201907,
    JoinSplit,
    Dividend,
    ZkAsset,
} = require('@aztec/contract-artifacts');
const ERC20Mintable = require('../build/ERC20Mintable.json');
const NoteStream = require('../build/NoteStream.json');
const StreamUtilitiesMock = require('../build/StreamUtilitiesMock.json');

const { getDepositNotes } = require('./helpers/AZTEC');

const generateFactoryId = (epoch, cryptoSystem, assetType) => {
    return epoch * 256 ** 2 + cryptoSystem * 256 ** 1 + assetType * 256 ** 0;
};

async function aztecFixture(provider, [wallet]) {
    ethers.errors.setLogLevel('error');

    // console.log('Starting deployment');
    const ace = await deployContract(wallet, ACE, [], { gasLimit: 5000000 });
    await ace.setCommonReferenceString(bn128.CRS);
    // console.log('Deployed ACE');

    const joinSplitValidator = await deployContract(wallet, JoinSplit, []);
    await ace.setProof(JOIN_SPLIT_PROOF, joinSplitValidator.address);
    // console.log('Deployed JoinSplit');

    const dividendValidator = await deployContract(wallet, Dividend, []);
    await ace.setProof(DIVIDEND_PROOF, dividendValidator.address);
    // console.log('Deployed Dividend');

    const baseFactory = await deployContract(wallet, FactoryBase201907, [
        ace.address,
    ]);
    await ace.setFactory(generateFactoryId(1, 1, 1), baseFactory.address);
    // console.log('Deployed Factory');

    // ethers.errors.setLogLevel('warn');
    return { ace, joinSplitValidator, dividendValidator, baseFactory };
}

async function zkAssetFixture(provider, [wallet]) {
    ethers.errors.setLogLevel('error');

    // deploy ace and initialise
    const {
        ace,
        joinSplitValidator,
        dividendValidator,
        baseFactory,
    } = await aztecFixture(provider, [wallet]);

    // Deploy ERC20 token and linked ZkAsset
    const token = await deployContract(wallet, ERC20Mintable, [
        'TESTCOIN',
        'TEST',
        18,
    ]);
    const zkAsset = await deployContract(wallet, ZkAsset, [
        ace.address,
        token.address,
        1,
    ]);

    const depositAmount = '10000000000000';

    await token.mint(wallet.address, depositAmount);
    await token.approve(ace.address, depositAmount);

    const {
        depositInputNotes,
        depositOutputNotes,
        depositPublicValue,
        depositInputOwnerAccounts,
    } = await getDepositNotes([100000], wallet.signingKey.privateKey);
    const publicValue = depositPublicValue * -1;

    const sender = wallet.address;
    const publicOwner = wallet.address;
    const proof = new JoinSplitProof(
        depositInputNotes,
        depositOutputNotes,
        sender,
        publicValue,
        publicOwner
    );
    const data = proof.encodeABI(zkAsset.address);
    const signatures = proof.constructSignatures(
        zkAsset.address,
        depositInputOwnerAccounts
    );

    // Approve ACE to spend tokens held by the zkAsset contract
    await ace.publicApprove(zkAsset.address, proof.hash, 100000);

    // convert some of sender's assets to zkAssets
    await zkAsset['confidentialTransfer(bytes,bytes)'](data, signatures);

    // ethers.errors.setLogLevel('warn');

    return {
        ace,
        joinSplitValidator,
        dividendValidator,
        baseFactory,
        token,
        zkAsset,
        depositOutputNotes,
    };
}

async function noteStreamFixture(provider, [wallet]) {
    ethers.errors.setLogLevel('error');

    // deploy ace and initialise
    const {
        ace,
        joinSplitValidator,
        dividendValidator,
        baseFactory,
        token,
        zkAsset,
        depositOutputNotes,
    } = await zkAssetFixture(provider, [wallet]);

    const noteStream = await deployContract(wallet, NoteStream, [ace.address]);

    return {
        ace,
        joinSplitValidator,
        dividendValidator,
        baseFactory,
        token,
        zkAsset,
        noteStream,
        depositOutputNotes,
    };
}

async function StreamUtilitiesFixture(provider, [wallet]) {
    ethers.errors.setLogLevel('error');

    // deploy ace and initialise
    const {
        ace,
        joinSplitValidator,
        dividendValidator,
        baseFactory,
        token,
        zkAsset,
    } = await zkAssetFixture(provider, [wallet]);

    const streamUtilitiesMock = await deployContract(
        wallet,
        StreamUtilitiesMock
    );

    return {
        ace,
        joinSplitValidator,
        dividendValidator,
        baseFactory,
        token,
        zkAsset,
        streamUtilitiesMock,
    };
}

module.exports = {
    aztecFixture,
    zkAssetFixture,
    noteStreamFixture,
    StreamUtilitiesFixture,
};
