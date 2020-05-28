const { use, expect } = require('chai');
const {
    solidity,
    MockProvider,
    createFixtureLoader,
} = require('ethereum-waffle');
const { bigNumberify, Interface } = require('ethers/utils');

const { devConstants, mochaContexts } = require('@notestream/dev-utils');
const moment = require('moment');
const crypto = require('crypto');

const NoteStream = require('../../build/NoteStream.json');
const { noteStreamFixture } = require('../fixtures');

const {
    contextForStreamDidEnd,
    contextForStreamDidStartButNotEnd,
} = mochaContexts;

const {
    // FIVE_UNITS,
    // STANDARD_SALARY,
    // STANDARD_SCALE,
    STANDARD_TIME_OFFSET,
    STANDARD_TIME_DELTA,
} = devConstants;

use(solidity);

const provider = new MockProvider();
const [sender, recipient, attacker] = provider.getWallets();
const loadFixture = createFixtureLoader(provider, [sender, recipient]);

const NoteStreamInterface = new Interface(NoteStream.abi);

function testValidCancellation() {
    // const dividendProof = crypto.randomBytes(1);
    // const joinSplitProof = crypto.randomBytes(1);
    // const cancellationDuration = bigNumberify(0).toString(10);

    it(
        'emits a cancel event'
        // , async function () {
        //         await expect(
        //             this.noteStream.cancelStream(
        //                 this.streamId,
        //                 dividendProof,
        //                 joinSplitProof,
        //                 cancellationDuration
        //             )
        //         ).to.emit(this.noteStream, 'CancelStream');
        //     });
    );
    it(
        'deletes the stream object'
        // , async function () {
        // await this.noteStream.cancelStream(
        //     this.streamId,
        //     dividendProof,
        //     joinSplitProof,
        //     cancellationDuration
        // );
        // await expect(
        //     this.noteStream.getStream(this.streamId)
        // ).to.be.revertedWith('stream does not exist');
        // }
    );
    it('returns true');
}

function runTests() {
    describe('when the stream did not start', function () {
        it('reverts when the cancellation has zero duration', async function () {
            const dividendProof = crypto.randomBytes(1);
            const joinSplitProof = crypto.randomBytes(1);
            const cancellationDuration = '0';
            await expect(
                this.noteStream.cancelStream(
                    this.streamId,
                    dividendProof,
                    joinSplitProof,
                    cancellationDuration
                )
            ).to.be.revertedWith('cancellation with zero unclaimed time');
        });

        describe('when the cancellation is valid', function () {
            testValidCancellation();
        });
    });

    contextForStreamDidStartButNotEnd(provider, function () {
        it('reverts when the cancellation has zero duration', async function () {
            const dividendProof = crypto.randomBytes(1);
            const joinSplitProof = crypto.randomBytes(1);
            const cancellationDuration = '0';
            await expect(
                this.noteStream.cancelStream(
                    this.streamId,
                    dividendProof,
                    joinSplitProof,
                    cancellationDuration
                )
            ).to.be.revertedWith('cancellation with zero unclaimed time');
        });

        testValidCancellation();
    });

    contextForStreamDidEnd(provider, function () {
        describe('when the cancellation has zero duration', function () {
            it('reverts when the stream has not been fully withdrawn', async function () {
                const dividendProof = crypto.randomBytes(1);
                const joinSplitProof = crypto.randomBytes(1);
                const cancellationDuration = '0';
                await expect(
                    this.noteStream.cancelStream(
                        this.streamId,
                        dividendProof,
                        joinSplitProof,
                        cancellationDuration
                    )
                ).to.be.revertedWith('cancellation with zero unclaimed time');
            });

            testValidCancellation();
        });

        describe('when the cancellation has non-zero duration', function () {
            it('reverts when the stream has been fully withdrawn');
            testValidCancellation();
        });
    });
}

describe('NoteStream - cancelStream', function () {
    let noteStream;
    let zkAsset;
    beforeEach(async function () {
        ({ noteStream, zkAsset } = await loadFixture(noteStreamFixture));
    });

    const now = bigNumberify(moment().format('X'));

    describe('when the stream exists', function () {
        let streamId;
        beforeEach(async function () {
            const startTime = now.add(
                STANDARD_TIME_OFFSET.multipliedBy(2).toString()
            );
            const stopTime = startTime.add(STANDARD_TIME_DELTA.toString());
            const notehash = crypto.randomBytes(32);
            const tx = await noteStream.createStream(
                recipient.address,
                notehash,
                zkAsset.address,
                startTime,
                stopTime
            );
            const receipt = await tx.wait();
            streamId = NoteStreamInterface.parseLog(
                receipt.logs[receipt.logs.length - 1]
            ).values.streamId;
        });

        describe('when the caller is the sender of the stream', function () {
            beforeEach(function () {
                this.noteStream = noteStream.connect(sender);
                this.streamId = streamId;
            });
            runTests();
        });

        describe('when the caller is the recipient of the stream', function () {
            beforeEach(function () {
                this.noteStream = noteStream.connect(recipient);
                this.streamId = streamId;
            });
            runTests();
        });

        it('reverts when the caller is not the sender or the recipient of the stream', async function () {
            const dividendProof = crypto.randomBytes(1);
            const joinSplitProof = crypto.randomBytes(1);
            const cancellationDuration = STANDARD_TIME_OFFSET.toString(10);
            await expect(
                noteStream
                    .connect(attacker)
                    .cancelStream(
                        streamId,
                        dividendProof,
                        joinSplitProof,
                        cancellationDuration
                    )
            ).to.be.revertedWith(
                'caller is not the sender or the recipient of the stream'
            );
        });
    });

    it('reverts when the stream does not exist', async function () {
        const dividendProof = crypto.randomBytes(1);
        const joinSplitProof = crypto.randomBytes(1);
        const cancellationDuration = STANDARD_TIME_OFFSET.toString(10);
        const streamId = bigNumberify(419863);
        await expect(
            noteStream
                .connect(recipient)
                .cancelStream(
                    streamId,
                    dividendProof,
                    joinSplitProof,
                    cancellationDuration
                )
        ).to.be.revertedWith('stream does not exist');
    });
});
