/* eslint-disable func-names */
const { devConstants } = require("@notestream/dev-utils");
const BigNumber = require("bignumber.js");
const moment = require("moment");
const crypto = require("crypto");
const truffleAssert = require("truffle-assertions");

const {
  // STANDARD_SALARY,
  STANDARD_TIME_OFFSET,
  STANDARD_TIME_DELTA,
  ZERO_ADDRESS,
} = devConstants;

function shouldBehaveLikeCreateStream(alice, bob) {
  const sender = alice;
  const opts = { from: sender };
  const now = new BigNumber(moment().format("X"));
  const startTime = now.plus(STANDARD_TIME_OFFSET);
  const stopTime = startTime.plus(STANDARD_TIME_DELTA);
  const notehash = crypto.randomBytes(32);

  describe("when not paused", function () {
    describe("when the recipient is valid", function () {
      const recipient = bob;

      it("creates the stream", async function () {
        const result = await this.noteStream.createStream(
          recipient,
          notehash,
          this.zkAsset.address,
          startTime,
          stopTime,
          opts
        );
        const streamObject = await this.noteStream.getStream(
          Number(result.logs[0].args.streamId)
        );
        streamObject.sender.should.be.equal(sender);
        streamObject.recipient.should.be.equal(recipient);
        streamObject.noteHash.should.be.equal(`0x${notehash.toString("hex")}`);
        streamObject.tokenAddress.should.be.equal(this.zkAsset.address);
        streamObject.startTime.should.be.bignumber.equal(startTime);
        streamObject.lastWithdrawTime.should.be.bignumber.equal(startTime);
        streamObject.stopTime.should.be.bignumber.equal(stopTime);
      });

      it("increases the next stream id", async function () {
        const nextStreamId = await this.noteStream.nextStreamId();
        await this.noteStream.createStream(
          recipient,
          notehash,
          this.zkAsset.address,
          startTime,
          stopTime,
          opts
        );
        const newNextStreamId = await this.noteStream.nextStreamId();
        newNextStreamId.should.be.bignumber.equal(nextStreamId.plus(1));
      });

      it("emits a createStream event", async function () {
        const result = await this.noteStream.createStream(
          recipient,
          notehash,
          this.zkAsset.address,
          startTime,
          stopTime,
          opts
        );
        truffleAssert.eventEmitted(result, "CreateStream");
      });
    });

    describe("when the recipient is the caller itself", function () {
      const recipient = sender;
      it("reverts", async function () {
        await truffleAssert.reverts(
          this.noteStream.createStream(
            recipient,
            notehash,
            this.zkAsset.address,
            startTime,
            stopTime,
            opts
          ),
          "stream to the caller"
        );
      });
    });

    describe("when the recipient is the NoteStream contract itself", function () {
      it("reverts", async function () {
        // Can't be defined in the context above because "this.noteStream" is undefined there
        const recipient = this.noteStream.address;
        await truffleAssert.reverts(
          this.noteStream.createStream(
            recipient,
            notehash,
            this.zkAsset.address,
            startTime,
            stopTime,
            opts
          ),
          "stream to the contract itself"
        );
      });
    });

    describe("when the recipient is the zero address", function () {
      const recipient = ZERO_ADDRESS;
      it("reverts", async function () {
        await truffleAssert.reverts(
          this.noteStream.createStream(
            recipient,
            notehash,
            this.zkAsset.address,
            startTime,
            stopTime,
            opts
          ),
          "stream to the zero address"
        );
      });
    });
  });

  describe("when paused", function () {
    const recipient = bob;

    beforeEach(async function () {
      // Note that `sender` coincides with the owner of the contract
      await this.noteStream.pause(opts);
    });

    it("reverts", async function () {
      await truffleAssert.reverts(
        this.noteStream.createStream(
          recipient,
          notehash,
          this.zkAsset.address,
          startTime,
          stopTime,
          opts
        ),
        "Pausable: paused"
      );
    });
  });
}

module.exports = shouldBehaveLikeCreateStream;
