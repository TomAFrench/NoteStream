/* eslint-disable no-console */
const env = require('@nomiclabs/buidler');
const { getContractAddressesForNetwork } = require('@aztec/contract-addresses');
const { ERC20_SCALING_FACTOR } = require('@aztec/dev-utils/lib/constants');

const chalk = require('chalk');

const erc20Address = '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c';

async function main() {
    console.log();
    const ethers = await env.ethers;
    // Read the address of the ACE contract on chosen network
    const networkId = env.network.config.chainId;

    const aceAddress = getContractAddressesForNetwork(networkId).ACE;
    console.log(
        `Using existing ${chalk.cyan('ACE')} at ${chalk.yellow(aceAddress)}`
    );

    process.stdout.write(`Deploying ${chalk.cyan('ZkAsset')}...\r`);
    const ZkAsset = await ethers.getContractFactory('ZkAsset');
    const zkAsset = await ZkAsset.deploy(
        aceAddress,
        erc20Address,
        ERC20_SCALING_FACTOR.toString()
    );
    await zkAsset.deployed();

    console.log(
        `Deployed ${chalk.cyan('ZkAsset')} to ${chalk.yellow(zkAsset.address)}`
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
