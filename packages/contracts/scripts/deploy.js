const env = require("@nomiclabs/buidler");
const { getContractAddressesForNetwork } = require("@aztec/contract-addresses");

const fs = require('fs')
const path = require('path')
const addressDirectory = path.resolve(__dirname, '../src/addresses/')

const TESTING_ADDRESS = "0xC6E67ee008a7720722e42F34f30a16d806A45c3F"

async function deployZkAsset(aceAddress) {
  // Deploy ERC20 token
  const ERC20DetailedMintable = env.artifacts.require("ERC20DetailedMintable");
  const erc20DetailedMintable = await ERC20DetailedMintable.new("TESTCOIN", "TEST", 18);
  await erc20DetailedMintable.mint(TESTING_ADDRESS, "100000");
  console.log("erc20Mintable address:", erc20DetailedMintable.address);

  // Deploy a ZkAsset linked to this ERC20
  const ZkAssetAdjustable = env.artifacts.require("ZkAssetAdjustable");
  const zkAsset = await ZkAssetAdjustable.new(aceAddress, erc20DetailedMintable.address, 1, 0, []);
  console.log("zkAsset address:", zkAsset.address);

  return zkAsset
}

function saveDeployedAddresses(addresses) {
  fs.writeFileSync(path.resolve(addressDirectory, `${env.network.name}.json`), JSON.stringify(addresses, null, 2))
}

async function main() {
  // Read the address of the ACE contract on rinkeby
  const { ACE: aceAddress } = getContractAddressesForNetwork(4)
  const zkAsset = await deployZkAsset(aceAddress)

  // Deploy the streaming contract
  const AztecStreamer = env.artifacts.require("AztecStreamer");
  const aztecStreamer = await AztecStreamer.new(aceAddress);

  console.log("Aztec address:", aztecStreamer.address);

  // Write deployed addresses to file
  const addresses = {
    ACE: aceAddress,
    ZkAsset: zkAsset.address,
    AztecStreamer: aztecStreamer.address
  }
  saveDeployedAddresses(addresses)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
