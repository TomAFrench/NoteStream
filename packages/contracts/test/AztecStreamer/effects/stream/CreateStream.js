const { devConstants } = require("@notestream/dev-utils");
const BigNumber = require("bignumber.js");
const moment = require("moment");
const truffleAssert = require("truffle-assertions");

const {
  STANDARD_SALARY,
  STANDARD_TIME_OFFSET,
  STANDARD_TIME_DELTA,
  ZERO_ADDRESS,
} = devConstants;

function shouldBehaveLikeERC1620Stream(alice, bob) {
  const sender = alice;
  const opts = { from: sender };
  const now = new BigNumber(moment().format("X"));

  // describe("when not paused", function() {
  //   describe("when the recipient is valid", function() {
  //     const recipient = bob;

  //   describe("when the recipient is the caller itself", function() {
  //     const recipient = sender;
  //     const deposit = STANDARD_SALARY.toString(10);
  //     const startTime = now.plus(STANDARD_TIME_OFFSET);
  //     const stopTime = startTime.plus(STANDARD_TIME_DELTA);

  //     it("reverts", async function() {
  //       await truffleAssert.reverts(
  //         this.sablier.createStream(recipient, deposit, this.token.address, startTime, stopTime, opts),
  //         "stream to the caller",
  //       );
  //     });
  //   });

  //   describe("when the recipient is the contract itself", function() {
  //     const deposit = STANDARD_SALARY.toString(10);
  //     const startTime = now.plus(STANDARD_TIME_OFFSET);
  //     const stopTime = startTime.plus(STANDARD_TIME_DELTA);

  //     it("reverts", async function() {
  //       // Can't be defined in the context above because "this.sablier" is undefined there
  //       const recipient = this.sablier.address;

  //       await truffleAssert.reverts(
  //         this.sablier.createStream(recipient, deposit, this.token.address, startTime, stopTime, opts),
  //         "stream to the contract itself",
  //       );
  //     });
  //   });

  //   describe("when the recipient is the zero address", function() {
  //     const recipient = ZERO_ADDRESS;
  //     const deposit = STANDARD_SALARY.toString(10);
  //     const startTime = now.plus(STANDARD_TIME_OFFSET);
  //     const stopTime = startTime.plus(STANDARD_TIME_DELTA);

  //     it("reverts", async function() {
  //       await truffleAssert.reverts(
  //         this.sablier.createStream(recipient, deposit, this.token.address, startTime, stopTime, opts),
  //         "stream to the zero address",
  //       );
  //     });
  //   });
  // });

  // describe("when paused", function() {
  //   const recipient = bob;
  //   const deposit = STANDARD_SALARY.toString(10);
  //   const startTime = now.plus(STANDARD_TIME_OFFSET);
  //   const stopTime = startTime.plus(STANDARD_TIME_DELTA);

  //   beforeEach(async function() {
  //     // Note that `sender` coincides with the owner of the contract
  //     await this.sablier.pause(opts);
  //   });

  //   it("reverts", async function() {
  //     await truffleAssert.reverts(
  //       this.sablier.createStream(recipient, deposit, this.token.address, startTime, stopTime, opts),
  //       "Pausable: paused",
  //     );
  //   });
  // });
}

module.exports = shouldBehaveLikeERC1620Stream;
