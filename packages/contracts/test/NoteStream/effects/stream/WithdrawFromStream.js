/* eslint-disable func-names */
const { devConstants, mochaContexts } = require("@notestream/dev-utils");
const BigNumber = require("bignumber.js");
const moment = require("moment");
const crypto = require("crypto");
const truffleAssert = require("truffle-assertions");

const {
  contextForStreamDidEnd,
  contextForStreamDidStartButNotEnd,
} = mochaContexts;
const {
  FIVE_UNITS,
  // STANDARD_SALARY,
  // STANDARD_SCALE,
  STANDARD_TIME_OFFSET,
  STANDARD_TIME_DELTA,
} = devConstants;

function runTests() {
  describe("when not paused", function () {
    describe("when the withdrawal amount is higher than 0", function () {
      describe("when the stream did not start", function () {
        const dividendProof = crypto.randomBytes(1);
        const joinSplitProof = crypto.randomBytes(1);
        const withrawDuration = FIVE_UNITS.toString(10);

        it("reverts", async function () {
          await truffleAssert.reverts(
            this.noteStream.withdrawFromStream(
              this.streamId,
              dividendProof,
              joinSplitProof,
              withrawDuration,
              this.opts
            ),
            "withdraw is greater than allowed"
          );
        });
      });

      contextForStreamDidStartButNotEnd(function () {
        //     describe("when the withdrawal amount does not exceed the available balance", function() {
        //       const withdrawalAmount = FIVE_UNITS.toString(10);

        //       it("withdraws from the stream", async function() {
        //         const balance = await this.token.balanceOf(this.recipient);
        //         await this.sablier.withdrawFromStream(this.streamId, withdrawalAmount, this.opts);
        //         const newBalance = await this.token.balanceOf(this.recipient);
        //         newBalance.should.be.bignumber.equal(balance.plus(FIVE_UNITS));
        //       });

        //       it("emits a withdrawfromstream event", async function() {
        //         const result = await this.sablier.withdrawFromStream(this.streamId, withdrawalAmount, this.opts);
        //         truffleAssert.eventEmitted(result, "WithdrawFromStream");
        //       });

        //       it("decreases the stream balance", async function() {
        //         const balance = await this.sablier.balanceOf(this.streamId, this.recipient, this.opts);
        //         await this.sablier.withdrawFromStream(this.streamId, withdrawalAmount, this.opts);
        //         const newBalance = await this.sablier.balanceOf(this.streamId, this.recipient, this.opts);
        //         // Intuitively, one may say we don't have to tolerate the block time variation here.
        //         // However, the Sablier balance for the recipient can only go up from the bottom
        //         // low of `balance` - `amount`, due to uncontrollable runtime costs.
        //         newBalance.should.tolerateTheBlockTimeVariation(balance.minus(withdrawalAmount), STANDARD_SCALE);
        //       });
        //     });

        describe("when the withdrawal amount exceeds the available balance", function () {
          const withdrawDuration = STANDARD_TIME_OFFSET.multipliedBy(
            2
          ).toString(10);

          it("reverts", async function () {
            const dividendProof = crypto.randomBytes(1);
            const joinSplitProof = crypto.randomBytes(1);
            await truffleAssert.reverts(
              this.noteStream.withdrawFromStream(
                this.streamId,
                dividendProof,
                joinSplitProof,
                withdrawDuration,
                this.opts
              ),
              "withdraw is greater than allowed"
            );
          });
        });
      });

      contextForStreamDidEnd(function () {
        //     describe("when the withdrawal amount does not exceed the available balance", function() {
        //       describe("when the balance is not withdrawn in full", function() {
        //         const withdrawalAmount = STANDARD_SALARY.dividedBy(2).toString(10);

        //         it("withdraws from the stream", async function() {
        //           const balance = await this.token.balanceOf(this.recipient);
        //           await this.sablier.withdrawFromStream(this.streamId, withdrawalAmount, this.opts);
        //           const newBalance = await this.token.balanceOf(this.recipient);
        //           newBalance.should.be.bignumber.equal(balance.plus(withdrawalAmount));
        //         });

        //         it("emits a withdrawfromstream event", async function() {
        //           const result = await this.sablier.withdrawFromStream(this.streamId, withdrawalAmount, this.opts);
        //           truffleAssert.eventEmitted(result, "WithdrawFromStream");
        //         });

        //         it("decreases the stream balance", async function() {
        //           const balance = await this.sablier.balanceOf(this.streamId, this.recipient);
        //           await this.sablier.withdrawFromStream(this.streamId, withdrawalAmount, this.opts);
        //           const newBalance = await this.sablier.balanceOf(this.streamId, this.recipient);
        //           newBalance.should.be.bignumber.equal(balance.minus(withdrawalAmount));
        //         });
        //       });

        //       describe("when the balance is withdrawn in full", function() {
        //         const withdrawalAmount = STANDARD_SALARY.toString(10);

        //         it("withdraws from the stream", async function() {
        //           const balance = await this.token.balanceOf(this.recipient);
        //           await this.sablier.withdrawFromStream(this.streamId, withdrawalAmount, this.opts);
        //           const newBalance = await this.token.balanceOf(this.recipient);
        //           newBalance.should.be.bignumber.equal(balance.plus(withdrawalAmount));
        //         });

        //         it("emits a withdrawfromstream event", async function() {
        //           const result = await this.sablier.withdrawFromStream(this.streamId, withdrawalAmount, this.opts);
        //           truffleAssert.eventEmitted(result, "WithdrawFromStream");
        //         });

        //         it("deletes the stream object", async function() {
        //           await this.sablier.withdrawFromStream(this.streamId, withdrawalAmount, this.opts);
        //           await truffleAssert.reverts(this.sablier.getStream(this.streamId), "stream does not exist");
        //         });
        //       });
        //     });

        describe("when the withdrawal amount exceeds the available balance", function () {
          const withdrawDuration = STANDARD_TIME_DELTA;

          it("reverts", async function () {
            const dividendProof = crypto.randomBytes(1);
            const joinSplitProof = crypto.randomBytes(1);
            await truffleAssert.reverts(
              this.noteStream.withdrawFromStream(
                this.streamId,
                dividendProof,
                joinSplitProof,
                withdrawDuration,
                this.opts
              ),
              "withdraw is greater than allowed"
            );
          });
        });
      });
    });

    describe("when the withdrawal amount is zero", function () {
      const dividendProof = crypto.randomBytes(1);
      const joinSplitProof = crypto.randomBytes(1);
      const withdrawalDuration = new BigNumber(0).toString(10);

      it("reverts", async function () {
        await truffleAssert.reverts(
          this.noteStream.withdrawFromStream(
            this.streamId,
            dividendProof,
            joinSplitProof,
            withdrawalDuration,
            this.opts
          ),
          "zero value withdrawal"
        );
      });
    });
  });

  describe("when paused", function () {
    const dividendProof = crypto.randomBytes(1);
    const joinSplitProof = crypto.randomBytes(1);
    const withdrawalDuration = STANDARD_TIME_OFFSET;

    beforeEach(async function () {
      // Note that `sender` coincides with the owner of the contract
      await this.noteStream.pause({ from: this.sender });
    });

    it("reverts", async function () {
      await truffleAssert.reverts(
        this.noteStream.withdrawFromStream(
          this.streamId,
          dividendProof,
          joinSplitProof,
          withdrawalDuration,
          this.opts
        ),
        "Pausable: paused"
      );
    });
  });
}

function shouldBehaveLikeWithdrawFromStream(alice, bob, eve) {
  const now = new BigNumber(moment().format("X"));

  describe("when the stream exists", function () {
    const startTime = now.plus(STANDARD_TIME_OFFSET);
    const stopTime = startTime.plus(STANDARD_TIME_DELTA);

    beforeEach(async function () {
      this.sender = alice;
      this.recipient = bob;
      const notehash = crypto.randomBytes(32);
      const opts = { from: this.sender };
      const result = await this.noteStream.createStream(
        this.recipient,
        notehash,
        this.token.address,
        startTime,
        stopTime,
        opts
      );
      this.streamId = Number(result.logs[0].args.streamId);
    });

    describe("when the caller is the sender of the stream", function () {
      const opts = { from: this.sender };
      const dividendProof = crypto.randomBytes(1);
      const joinSplitProof = crypto.randomBytes(1);
      const withdrawDuration = 1;

      it("reverts", async function () {
        await truffleAssert.reverts(
          this.noteStream.withdrawFromStream(
            this.streamId,
            dividendProof,
            joinSplitProof,
            withdrawDuration,
            opts
          ),
          "caller is not the recipient of the stream"
        );
      });
    });

    describe("when the caller is the recipient of the stream", function () {
      beforeEach(function () {
        this.opts = { from: this.recipient };
      });

      runTests();
    });

    describe("when the caller is not the sender or the recipient of the stream", function () {
      const opts = { from: eve };
      const dividendProof = crypto.randomBytes(1);
      const joinSplitProof = crypto.randomBytes(1);
      const withdrawDuration = 1;

      it("reverts", async function () {
        await truffleAssert.reverts(
          this.noteStream.withdrawFromStream(
            this.streamId,
            dividendProof,
            joinSplitProof,
            withdrawDuration,
            opts
          ),
          "caller is not the recipient of the stream"
        );
      });
    });
  });

  describe("when the stream does not exist", function () {
    const recipient = bob;
    const opts = { from: recipient };
    const dividendProof = crypto.randomBytes(1);
    const joinSplitProof = crypto.randomBytes(1);
    const withdrawDuration = 1;

    it("reverts", async function () {
      const streamId = new BigNumber(419863);
      await truffleAssert.reverts(
        this.noteStream.withdrawFromStream(
          streamId,
          dividendProof,
          joinSplitProof,
          withdrawDuration,
          opts
        ),
        "stream does not exist"
      );
    });
  });
}

module.exports = shouldBehaveLikeWithdrawFromStream;
