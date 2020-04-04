const { devConstants } = require("@notestream/dev-utils");
const truffleAssert = require("truffle-assertions");

const shouldBehaveLikeGetStream = require("./view/GetStream");

const shouldBehaveLikeERC1620CreateStream = require("./effects/stream/CreateStream");
const shouldBehaveLikeERC1620WithdrawFromStream = require("./effects/stream/WithdrawFromStream");

const shouldBehaveLikeERC1620CancelStream = require("./effects/stream/CancelStream");


const AztecStreamer = artifacts.require("./AztecStreamer.sol");
const { ZERO_ADDRESS } = devConstants;

function shouldBehaveLikeAztecStreamer(alice, bob, carol, eve) {
  describe("initialization", function() {
    it("reverts when the ACE contract is the zero address", async function() {
      const opts = { from: alice };
      await truffleAssert.reverts(AztecStreamer.new(ZERO_ADDRESS, opts), "ACE contract is the zero address");
    });
  });

  describe("admin functions", function() {
  });

  describe("view functions", function() {
    describe("getStream", function() {
      shouldBehaveLikeGetStream(alice);
    });
  });

  // describe("effects & interactions functions", function() {
  //   describe("createStream", function() {
  //     shouldBehaveLikeERC1620CreateStream(alice, bob);
  //   });

  //   describe("withdrawFromStream", function() {
  //     shouldBehaveLikeERC1620WithdrawFromStream(alice, bob, eve);
  //   });

  //   describe("cancelStream", function() {
  //     shouldBehaveLikeERC1620CancelStream(alice, bob, eve);
  //   });
  // });
}

module.exports = shouldBehaveLikeAztecStreamer;
