const { waffle } = require('@nomiclabs/buidler');
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
    FIVE_UNITS,
    // STANDARD_SALARY,
    // STANDARD_SCALE,
    STANDARD_TIME_OFFSET,
    STANDARD_TIME_DELTA,
} = devConstants;

use(solidity);

function runTests() {
    const { provider } = waffle;
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    const NoteStreamInterface = new Interface(NoteStream.abi);

    let noteStream;
    let zkAsset;
    let streamId;
    beforeEach(async function () {
        ({ noteStream, zkAsset } = await loadFixture(noteStreamFixture));
        const now = bigNumberify(moment().format('X'));
        const startTime = now.add(STANDARD_TIME_OFFSET.toString());
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
        noteStream = noteStream.connect(recipient);
    });

    describe('when the withdrawal amount is higher than 0', function () {
        it('reverts if the stream did not start', async function () {
            const dividendProof = crypto.randomBytes(1);
            const joinSplitProof = crypto.randomBytes(1);
            const withrawDuration = FIVE_UNITS.toString(10);
            await expect(
                noteStream.withdrawFromStream(
                    streamId,
                    dividendProof,
                    joinSplitProof,
                    withrawDuration
                )
            ).to.be.revertedWith('withdraw is greater than allowed');
        });

        contextForStreamDidStartButNotEnd(provider, function () {
            it('reverts if the withdrawal amount exceeds the available balance', async function () {
                const withdrawDuration = STANDARD_TIME_OFFSET.multipliedBy(
                    2
                ).toString(10);
                const dividendProof = crypto.randomBytes(1);
                const joinSplitProof = crypto.randomBytes(1);
                await expect(
                    noteStream.withdrawFromStream(
                        streamId,
                        dividendProof,
                        joinSplitProof,
                        withdrawDuration
                    )
                ).to.be.revertedWith('withdraw is greater than allowed');
            });
            it('updates the streams lastWithdrawTime parameter');
            it('emits a WithdrawFromStream event');
        });

        contextForStreamDidEnd(provider, function () {
            it('reverts if the withdrawal amount exceeds the available balance', async function () {
                const withdrawDuration = bigNumberify(
                    STANDARD_TIME_DELTA.toString()
                )
                    .mul(2)
                    .toString();
                const dividendProof = crypto.randomBytes(1);
                const joinSplitProof = crypto.randomBytes(1);
                await expect(
                    noteStream.withdrawFromStream(
                        streamId,
                        dividendProof,
                        joinSplitProof,
                        withdrawDuration
                    )
                ).to.be.revertedWith('withdraw is greater than allowed');
            });
            describe('when the balance is not withdrawn in full', function () {
                it('updates the streams lastWithdrawTime parameter');
                it('emits a WithdrawFromStream event');
            });
            describe('when the balance is withdrawn in full', function () {
                it('updates the streams lastWithdrawTime parameter');
                it('emits a WithdrawFromStream event');
            });
        });
    });

    it('reverts when the withdrawal amount is zero', async function () {
        const dividendProof = crypto.randomBytes(1);
        const joinSplitProof = crypto.randomBytes(1);
        const withdrawalDuration = '0';
        await expect(
            noteStream.withdrawFromStream(
                streamId,
                dividendProof,
                joinSplitProof,
                withdrawalDuration
            )
        ).to.be.revertedWith('zero value withdrawal');
    });
}

describe('NoteStream - withdrawFromStream', function () {
    const provider = new MockProvider();
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    const NoteStreamInterface = new Interface(NoteStream.abi);

    let noteStream;
    let zkAsset;
    beforeEach(async function () {
        ({ noteStream, zkAsset } = await loadFixture(noteStreamFixture));
    });

    describe('when the stream exists', function () {
        let streamId;
        beforeEach(async function () {
            const now = bigNumberify(moment().format('X'));
            const startTime = now.add(STANDARD_TIME_OFFSET.toString());
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

        it('reverts when the caller is the sender of the stream', async function () {
            const dividendProof = crypto.randomBytes(1);
            const joinSplitProof = crypto.randomBytes(1);
            const withdrawDuration = 1;
            await expect(
                noteStream.withdrawFromStream(
                    streamId,
                    dividendProof,
                    joinSplitProof,
                    withdrawDuration
                )
            ).to.be.revertedWith('caller is not the recipient of the stream');
        });

        describe('when the caller is the recipient of the stream', function () {
            runTests();
        });

        it('reverts when the caller is not the sender or the recipient of the stream', async function () {
            const dividendProof = crypto.randomBytes(1);
            const joinSplitProof = crypto.randomBytes(1);
            const withdrawDuration = 1;
            await expect(
                noteStream.withdrawFromStream(
                    streamId,
                    dividendProof,
                    joinSplitProof,
                    withdrawDuration
                )
            ).to.be.revertedWith('caller is not the recipient of the stream');
        });
    });

    it('reverts when the stream does not exist', async function () {
        const dividendProof = crypto.randomBytes(1);
        const joinSplitProof = crypto.randomBytes(1);
        const withdrawDuration = 1;
        const streamId = bigNumberify(419863);
        await expect(
            noteStream
                .connect(recipient)
                .withdrawFromStream(
                    streamId,
                    dividendProof,
                    joinSplitProof,
                    withdrawDuration
                )
        ).to.be.revertedWith('stream does not exist');
    });
});
