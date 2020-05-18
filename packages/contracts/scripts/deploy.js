/* eslint-disable no-console */
const env = require('@nomiclabs/buidler');
const { getContractAddressesForNetwork } = require('@aztec/contract-addresses');
const bn128 = require('@aztec/bn128');
const { proofs } = require('@aztec/dev-utils');

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const addressDirectory = path.resolve(
    __dirname,
    '../../contract-artifacts/addresses/'
);

const TESTING_ADDRESS = '0xC6E67ee008a7720722e42F34f30a16d806A45c3F';

async function deployAZTEC() {
    process.stdout.write(`Deploying ${chalk.cyan('ACE')}...\r`);
    const ACE = env.artifacts.require('ACE');
    const ace = await ACE.new();
    console.log(
        `Deployed ${chalk.cyan('ACE')} to ${chalk.yellow(ace.address)}`
    );

    console.log('Setting CRS');
    await ace.setCommonReferenceString(bn128.CRS);

    const { JOIN_SPLIT_PROOF, DIVIDEND_PROOF } = proofs;

    process.stdout.write(
        `Deploying ${chalk.cyan('JoinSplit validator contract')}...\r`
    );
    const JoinSplitValidator = env.artifacts.require('./JoinSplit');
    const joinSplitValidator = await JoinSplitValidator.new();
    await ace.setProof(JOIN_SPLIT_PROOF, joinSplitValidator.address);
    console.log(
        `Deployed ${chalk.cyan(
            'JoinSplit validator contract'
        )} to ${chalk.yellow(joinSplitValidator.address)}`
    );
    process.stdout.write(
        `Deploying ${chalk.cyan('Dividend validator contract')}...\r`
    );
    const DividendValidator = env.artifacts.require('./Dividend');
    const dividendValidator = await DividendValidator.new();
    console.log(
        `Deployed ${chalk.cyan(
            'Dividend validator contract'
        )} to ${chalk.yellow(dividendValidator.address)}`
    );
    await ace.setProof(DIVIDEND_PROOF, dividendValidator.address);

    const generateFactoryId = (epoch, cryptoSystem, assetType) =>
        epoch * 256 ** 2 + cryptoSystem * 256 ** 1 + assetType * 256 ** 0;

    process.stdout.write(`Deploying ${chalk.cyan('Note Registry')}...\r`);
    const BaseFactory = env.artifacts.require(
        './noteRegistry/epochs/201912/base/FactoryBase201912'
    );
    const baseFactory = await BaseFactory.new(ace.address);
    console.log(
        `Deployed ${chalk.cyan('Note Registry')} to ${chalk.yellow(
            baseFactory.address
        )}`
    );
    await ace.setFactory(generateFactoryId(1, 1, 1), baseFactory.address);

    return ace;
}

async function deployZkAsset(aceAddress) {
    process.stdout.write(`Deploying ${chalk.cyan('ERC20')}...\r`);
    const ERC20Mintable = env.artifacts.require('ERC20Mintable');
    const erc20Mintable = await ERC20Mintable.new('TESTCOIN', 'TEST', 18);
    await erc20Mintable.mint(TESTING_ADDRESS, '100000');
    console.log(
        `Deployed ${chalk.cyan('Note Registry')} to ${chalk.yellow(
            erc20Mintable.address
        )}`
    );

    // Deploy a ZkAsset linked to this ERC20
    process.stdout.write(`Deploying ${chalk.cyan('ZkAsset')}...\r`);
    const ZkAsset = env.artifacts.require('ZkAsset');
    const zkAsset = await ZkAsset.new(aceAddress, erc20Mintable.address, 1);
    console.log(
        `Deployed ${chalk.cyan('ZkAsset')} to ${chalk.yellow(zkAsset.address)}`
    );

    return zkAsset;
}

function saveDeployedAddresses(addresses) {
    fs.writeFileSync(
        path.resolve(addressDirectory, `${env.network.name}.json`),
        JSON.stringify(addresses, null, 2)
    );
}

async function main() {
    console.log();
    // Read the address of the ACE contract on chosen network
    const networkId = env.network.config.chainId;
    const addresses = {};

    try {
        addresses.ACE = getContractAddressesForNetwork(networkId).ACE;
        console.log(
            `Using existing ${chalk.cyan('ACE')} at ${chalk.yellow(
                addresses.ACE
            )}`
        );
    } catch (e) {
        // throw new Error("Unsupported Network")
        console.log('This network is unsupported by AZTEC');

        // Assume we're in BuidlerEVM/Ganache
        // We need to deploy ACE and a ZkAsset
        const ace = await deployAZTEC();
        addresses.ACE = ace.address;

        const zkAsset = await deployZkAsset(addresses.ACE);
        addresses.ZkAsset = zkAsset.address;
    }

    process.stdout.write(`Deploying ${chalk.cyan('NoteStream')}...\r`);
    const NoteStream = env.artifacts.require('NoteStream');
    const noteStream = await NoteStream.new(addresses.ACE);
    addresses.NoteStream = noteStream.address;

    console.log(
        `Deployed ${chalk.cyan('NoteStream')} to ${chalk.yellow(
            noteStream.address
        )}`
    );

    // Write deployed addresses to file
    saveDeployedAddresses(addresses);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
