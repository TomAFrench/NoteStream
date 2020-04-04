const { devConstants } = require("@notestream/dev-utils");
const shouldBehaveLikeAztecStreamer = require("./AztecStreamer.behavior");

const ACE = artifacts.require("./ACE.sol");
const AztecStreamer = artifacts.require("./AztecStreamer.sol");

ACE.numberFormat = "BigNumber";
AztecStreamer.numberFormat = "BigNumber";

const { STANDARD_SALARY } = devConstants;

contract("AztecStreamer", function aztecStreamer([alice, bob, carol, eve]) {
  beforeEach(async function() {
    const opts = { from: alice };
    // this.ace = await ACE.new(opts);
    this.aztecStreamer = await AztecStreamer.new(eve, opts);
  });

  shouldBehaveLikeAztecStreamer(alice, bob, carol, eve);
});
