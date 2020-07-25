// const { devConstants } = require("@notestream/dev-utils");
const { waffle } = require('@nomiclabs/buidler');
const { use, expect } = require('chai');
const { solidity, createFixtureLoader } = require('ethereum-waffle');
const { bigNumberify, Interface } = require('ethers/utils');
const { devConstants } = require('@notestream/dev-utils');
const moment = require('moment');

const {
    // STANDARD_SALARY,
    STANDARD_TIME_OFFSET,
    STANDARD_TIME_DELTA,
    ZERO_ADDRESS,
} = devConstants;

const NoteStream = require('../../build/NoteStream.json');
const { noteStreamFixture } = require('../fixtures');
const { mintZkAsset } = require('../helpers/mint/mintZkAssets');
const { signProof } = require('../helpers/signProof');
const { createStreamDepositProof } = require('../helpers/deposit/streamNote');

use(solidity);

describe('NoteStream - createStream', function () {
    const { provider } = waffle;
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    const NoteStreamInterface = new Interface(NoteStream.abi);

    let ace;
    let token;
    let noteStream;
    let zkAsset;
    let streamNote;
    let data;
    let signature;
    const streamDeposit = 100000;
    beforeEach(async function () {
        ({ ace, token, noteStream, zkAsset } = await loadFixture(
            noteStreamFixture
        ));

        const depositOutputNote = await mintZkAsset(
            sender.address,
            streamDeposit,
            token,
            zkAsset,
            ace
        );

        const { depositProof } = await createStreamDepositProof(
            [depositOutputNote],
            noteStream.address,
            sender.address,
            recipient.address,
            0
        );

        [streamNote] = depositProof.outputNotes;

        ({ data, signature } = signProof(
            zkAsset,
            depositProof,
            noteStream.address,
            sender.signingKey.privateKey
        ));
    });

    const now = bigNumberify(moment().format('X'));
    const startTime = now.add(STANDARD_TIME_OFFSET.toString());
    const stopTime = startTime.add(STANDARD_TIME_DELTA.toString());

    describe('when not paused', function () {
        describe('when the recipient is valid', function () {
            it('creates the stream', async function () {
                const tx = await noteStream.createStream(
                    recipient.address,
                    data,
                    signature,
                    zkAsset.address,
                    startTime,
                    stopTime
                );
                const receipt = await tx.wait();
                const { streamId } = NoteStreamInterface.parseLog(
                    receipt.logs[receipt.logs.length - 1]
                ).values;

                const streamObject = await noteStream.getStream(streamId);
                expect(streamObject.sender).to.equal(sender.address);
                expect(streamObject.recipient).to.equal(recipient.address);
                expect(streamObject.noteHash).to.equal(streamNote.noteHash);

                expect(streamObject.tokenAddress).to.equal(zkAsset.address);
                expect(streamObject.startTime).to.equal(startTime);
                expect(streamObject.lastWithdrawTime).to.equal(startTime);
                expect(streamObject.stopTime).to.equal(stopTime);
            });

            it('increases the next stream id', async function () {
                const currentStreamId = await noteStream.nextStreamId();
                await noteStream.createStream(
                    recipient.address,
                    data,
                    signature,
                    zkAsset.address,
                    startTime,
                    stopTime
                );

                const nextStreamId = await noteStream.nextStreamId();
                expect(nextStreamId).to.equal(currentStreamId.add(1));
            });

            it('emits a createStream event', async function () {
                await expect(
                    noteStream.createStream(
                        recipient.address,
                        data,
                        signature,
                        zkAsset.address,
                        startTime,
                        stopTime
                    )
                ).to.emit(noteStream, 'CreateStream');
            });

            it('reverts when the stream starts in the past', async function () {
                const invalidStartTime = now.sub(
                    STANDARD_TIME_OFFSET.toString()
                );
                await expect(
                    noteStream.createStream(
                        recipient.address,
                        data,
                        signature,
                        zkAsset.address,
                        invalidStartTime,
                        stopTime
                    )
                ).to.be.revertedWith('start time before block.timestamp');
            });

            it('reverts when the stream duration is zero', async function () {
                await expect(
                    noteStream.createStream(
                        recipient.address,
                        data,
                        signature,
                        zkAsset.address,
                        startTime,
                        startTime
                    )
                ).to.be.revertedWith('Stream duration not greater than zero');
            });

            it('reverts when the stream duration is zero', async function () {
                const invalidStopTime = startTime.sub(
                    STANDARD_TIME_DELTA.toString()
                );
                await expect(
                    noteStream.createStream(
                        recipient.address,
                        data,
                        signature,
                        zkAsset.address,
                        startTime,
                        invalidStopTime
                    )
                ).to.be.revertedWith('Stream duration not greater than zero');
            });
        });

        it('reverts when the recipient is the caller itself', async function () {
            await expect(
                noteStream.createStream(
                    sender.address,
                    data,
                    signature,
                    zkAsset.address,
                    startTime,
                    stopTime
                )
            ).to.be.revertedWith('stream to the caller');
        });

        it('reverts when the recipient is the NoteStream contract itself', async function () {
            await expect(
                noteStream.createStream(
                    noteStream.address,
                    data,
                    signature,
                    zkAsset.address,
                    startTime,
                    stopTime
                )
            ).to.be.revertedWith('stream to the contract itself');
        });

        it('reverts when the recipient is the zero address', async function () {
            await expect(
                noteStream.createStream(
                    ZERO_ADDRESS,
                    data,
                    signature,
                    zkAsset.address,
                    startTime,
                    stopTime
                )
            ).to.be.revertedWith('stream to the zero address');
        });
    });

    it('reverts when paused', async function () {
        // Note that `sender` coincides with the owner of the contract

        await noteStream.pause();
        await expect(
            noteStream.createStream(
                recipient.address,
                data,
                signature,
                zkAsset.address,
                startTime,
                stopTime
            )
        ).to.be.revertedWith('Pausable: paused');
    });
});
