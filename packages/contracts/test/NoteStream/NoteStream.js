/* eslint-disable func-names */
// const { devConstants } = require("@notestream/dev-utils");
const env = require("@nomiclabs/buidler");

const bn128 = require("@aztec/bn128");
const { proofs } = require("@aztec/dev-utils");

const shouldBehaveLikeNoteStream = require("./NoteStream.behavior");

const ACE = env.artifacts.require("./ACE.sol");
const BaseFactory = env.artifacts.require(
  "./noteRegistry/epochs/201912/base/FactoryBase201912"
);
const JoinSplitValidator = env.artifacts.require("./JoinSplit");
const JoinSplitValidatorInterface = env.artifacts.require(
  "./JoinSplitInterface"
);
const DividendValidator = env.artifacts.require("./Dividend");
const DividendValidatorInterface = env.artifacts.require("./DividendInterface");

const ERC20DetailedMintable = env.artifacts.require("ERC20DetailedMintable");
const ZkAsset = env.artifacts.require("ZkAsset");

const NoteStream = env.artifacts.require("./NoteStream.sol");

ACE.numberFormat = "BigNumber";
JoinSplitValidator.numberFormat = "BigNumber";
DividendValidator.numberFormat = "BigNumber";
NoteStream.numberFormat = "BigNumber";

JoinSplitValidator.abi = JoinSplitValidatorInterface.abi;
DividendValidator.abi = DividendValidatorInterface.abi;

const { JOIN_SPLIT_PROOF, DIVIDEND_PROOF } = proofs;
// const { STANDARD_SALARY } = devConstants;

const generateFactoryId = (epoch, cryptoSystem, assetType) => {
  return epoch * 256 ** 2 + cryptoSystem * 256 ** 1 + assetType * 256 ** 0;
};

contract("NoteStream", function noteStream([alice, bob, carol, eve]) {
  beforeEach(async function () {
    const opts = { from: alice };

    const ace = await ACE.new(opts);
    await ace.setCommonReferenceString(bn128.CRS, opts);

    const joinSplitValidator = await JoinSplitValidator.new(opts);
    await ace.setProof(JOIN_SPLIT_PROOF, joinSplitValidator.address);

    const dividendValidator = await DividendValidator.new(opts);
    await ace.setProof(DIVIDEND_PROOF, dividendValidator.address);

    const baseFactory = await BaseFactory.new(ace.address);
    await ace.setFactory(generateFactoryId(1, 1, 1), baseFactory.address, opts);

    // Deploy ERC20 token and linked ZkAsset
    this.token = await ERC20DetailedMintable.new("TESTCOIN", "TEST", 18);
    this.zkAsset = await ZkAsset.new(ace.address, this.token.address, 1, opts);

    this.noteStream = await NoteStream.new(eve, opts);
  });

  shouldBehaveLikeNoteStream(alice, bob, carol, eve);
});
