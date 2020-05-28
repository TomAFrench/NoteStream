const { waffle } = require('@nomiclabs/buidler');
const { use, expect } = require('chai');
const { solidity, createFixtureLoader } = require('ethereum-waffle');
const { JoinSplitProof } = require('aztec.js');

const { StreamUtilitiesFixture } = require('../fixtures');
const { createNote } = require('../helpers/notes/createNote');
const { mintZkAsset } = require('../helpers/mint/mintZkAssets');

use(solidity);

describe('StreamUtilities - processCancellation', function () {
    const { provider } = waffle;
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    let ace;
    let token;
    let zkAsset;
    let streamNote;
    let streamUtilitiesMock;
    let streamObject;
    const streamDeposit = 100000;
    beforeEach(async function () {
        ({ ace, streamUtilitiesMock, token, zkAsset } = await loadFixture(
            StreamUtilitiesFixture
        ));

        streamNote = await mintZkAsset(
            streamUtilitiesMock.address,
            streamDeposit,
            token,
            zkAsset,
            ace
        );

        streamObject = {
            noteHash: streamNote.noteHash,
            startTime: 0,
            lastWithdrawTime: 50,
            stopTime: 100,
            recipient: recipient.address,
            sender: sender.address,
            tokenAddress: zkAsset.address,
            isEntity: true,
        };
    });

    const runTest = async (
        withdrawNoteOwner,
        withdrawNoteViewAccess,
        refundNoteOwner,
        refundNoteViewAccess,
        error
    ) => {
        const withdrawalNote = await createNote(
            streamNote.k.toNumber() / 4,
            withdrawNoteOwner,
            [withdrawNoteViewAccess]
        );

        const refundNote = await createNote(
            (streamNote.k.toNumber() * 3) / 4,
            refundNoteOwner,
            [refundNoteViewAccess]
        );

        const badProof = new JoinSplitProof(
            [streamNote],
            [withdrawalNote, refundNote],
            streamUtilitiesMock.address,
            0,
            withdrawNoteOwner
        );

        const badProofData = badProof.encodeABI(zkAsset.address);

        await expect(
            streamUtilitiesMock.processCancelation(
                ace.address,
                badProofData,
                withdrawalNote.noteHash,
                streamObject
            )
        ).to.be.revertedWith(error);
    };

    it('reverts if withdraw note is not owned by recipient', async function () {
        await runTest(
            sender.address, // incorrect
            recipient.address,
            sender.address,
            sender.address,
            "Stream recipient doesn't own first output note"
        );
    });

    it('reverts if refund note is not owned by sender', async function () {
        await runTest(
            recipient.address,
            recipient.address,
            recipient.address, // incorrect
            sender.address,
            "Stream sender doesn't own second output note"
        );
    });

    it('reverts if recipient does not have view access to the withdraw note', async function () {
        await runTest(
            recipient.address,
            sender.address, // incorrect
            sender.address,
            sender.address,
            "stream recipient can't view withdrawal note"
        );
    });

    it('reverts if sender does not have view access to the refund note', async function () {
        await runTest(
            recipient.address,
            recipient.address,
            sender.address,
            recipient.address, // incorrect
            "stream sender can't view refund note"
        );
    });

    it('transfers the zkAssets to the sender and recipient', async function () {
        const withdrawalNote = await createNote(
            streamNote.k.toNumber() / 4,
            recipient.address,
            [recipient.address]
        );

        const refundNote = await createNote(
            (streamNote.k.toNumber() * 3) / 4,
            sender.address,
            [sender.address]
        );

        const proof = new JoinSplitProof(
            [streamNote],
            [withdrawalNote, refundNote],
            streamUtilitiesMock.address,
            0,
            sender.address
        );

        const proofData = proof.encodeABI(zkAsset.address);

        await expect(
            streamUtilitiesMock.processCancelation(
                ace.address,
                proofData,
                withdrawalNote.noteHash,
                streamObject
            )
        )
            .to.emit(zkAsset, 'DestroyNote')
            .withArgs(streamUtilitiesMock.address, streamNote.noteHash);
    });
});
