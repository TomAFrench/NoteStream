const env = require("@nomiclabs/buidler");

const { devConstants } = require("@notestream/dev-utils");
const truffleAssert = require("truffle-assertions");

const shouldBehaveLikeGetStream = require("./view/GetStream");

const shouldBehaveLikeCreateStream = require("./effects/stream/CreateStream");
const shouldBehaveLikeWithdrawFromStream = require("./effects/stream/WithdrawFromStream");
const shouldBehaveLikeCancelStream = require("./effects/stream/CancelStream");

const NoteStream = env.artifacts.require("./NoteStream.sol");
const { ZERO_ADDRESS } = devConstants;

function shouldBehaveLikeNoteStream(alice, bob, carol, eve) {
  describe("initialization", function () {
    it("reverts when the ACE contract is the zero address", async function () {
      const opts = { from: alice };
      await truffleAssert.reverts(
        NoteStream.new(ZERO_ADDRESS, opts),
        "ACE contract is the zero address"
      );
    });
  });

  describe("admin functions", function () {});

  describe("view functions", function () {
    describe("getStream", function () {
      shouldBehaveLikeGetStream(alice);
    });
  });

  describe("effects & interactions functions", function () {
    describe("createStream", function () {
      shouldBehaveLikeCreateStream(alice, bob);
    });

    describe("withdrawFromStream", function () {
      shouldBehaveLikeWithdrawFromStream(alice, bob, eve);
    });

    describe("cancelStream", function () {
      shouldBehaveLikeCancelStream(alice, bob, eve);
    });
  });
}

module.exports = shouldBehaveLikeNoteStream;
