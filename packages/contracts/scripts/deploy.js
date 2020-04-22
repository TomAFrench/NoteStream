/* eslint-disable no-console */
const env = require("@nomiclabs/buidler");
const { getContractAddressesForNetwork } = require("@aztec/contract-addresses");
const bn128 = require("@aztec/bn128");
const { proofs } = require("@aztec/dev-utils");

const fs = require("fs");
const path = require("path");

const addressDirectory = path.resolve(
  __dirname,
  "../../contract-artifacts/addresses/"
);

const TESTING_ADDRESS = "0xC6E67ee008a7720722e42F34f30a16d806A45c3F";

async function deployAZTEC() {
  console.log("Deploying ACE contract");
  const ACE = env.artifacts.require("ACE");
  const ace = await ACE.new();
  console.log("ACE address:", ace.address);

  console.log("Setting CRS");
  await ace.setCommonReferenceString(bn128.CRS);

  const { JOIN_SPLIT_PROOF, DIVIDEND_PROOF } = proofs;

  console.log("Deploying JoinSplit validator contract");
  const JoinSplitValidator = env.artifacts.require("./JoinSplit");
  const joinSplitValidator = await JoinSplitValidator.new();
  await ace.setProof(JOIN_SPLIT_PROOF, joinSplitValidator.address);

  console.log("Deploying Dividend validator contract");
  const DividendValidator = env.artifacts.require("./Dividend");
  const dividendValidator = await DividendValidator.new();
  await ace.setProof(DIVIDEND_PROOF, dividendValidator.address);

  const generateFactoryId = (epoch, cryptoSystem, assetType) =>
    epoch * 256 ** 2 + cryptoSystem * 256 ** 1 + assetType * 256 ** 0;

  console.log("Deploying noteRegistry contract");
  const BaseFactory = env.artifacts.require(
    "./noteRegistry/epochs/201912/base/FactoryBase201912"
  );
  const baseFactory = await BaseFactory.new(ace.address);
  await ace.setFactory(generateFactoryId(1, 1, 1), baseFactory.address);

  return ace;
}

async function deployZkAsset(aceAddress) {
  // Deploy ERC20 token
  const ERC20DetailedMintable = env.artifacts.require("ERC20DetailedMintable");
  const erc20DetailedMintable = await ERC20DetailedMintable.new(
    "TESTCOIN",
    "TEST",
    18
  );
  await erc20DetailedMintable.mint(TESTING_ADDRESS, "100000");
  console.log("erc20Mintable address:", erc20DetailedMintable.address);

  // Deploy a ZkAsset linked to this ERC20
  const ZkAsset = env.artifacts.require("ZkAsset");
  const zkAsset = await ZkAsset.new(
    aceAddress,
    erc20DetailedMintable.address,
    1
  );
  console.log("zkAsset address:", zkAsset.address);

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
    console.log("Using existing ACE");
    console.log("ACE address:", addresses.ACE);
  } catch (e) {
    // throw new Error("Unsupported Network")
    console.log("This network is unsupported by AZTEC");

    // Assume we're in BuidlerEVM/Ganache
    // We need to deploy ACE and a ZkAsset
    const ace = await deployAZTEC();
    addresses.ACE = ace.address;

    const zkAsset = await deployZkAsset(addresses.ACE);
    addresses.ZkAsset = zkAsset.address;
  }

  // Deploy the streaming contract
  const NoteStream = env.artifacts.require("NoteStream");
  const noteStream = await NoteStream.new(addresses.ACE);
  addresses.NoteStream = noteStream.address;

  console.log("NoteStream address:", noteStream.address);

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
