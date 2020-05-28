const { waffle } = require('@nomiclabs/buidler');
const { use, expect } = require('chai');
const { solidity, createFixtureLoader } = require('ethereum-waffle');
const { JoinSplitProof } = require('aztec.js');

const { StreamUtilitiesFixture } = require('../fixtures');
const { mintZkAsset } = require('../helpers/mint/mintZkAssets');
const { createNote } = require('../helpers/notes/createNote');

use(solidity);

describe('StreamUtilities - processWithdrawal', function () {
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

    it('reverts if new streamNote is not owned by NoteStream contract', async function () {
        const withdrawalNote = await createNote(
            streamNote.k.toNumber() / 4,
            recipient.address,
            [recipient.address]
        );

        // Try to steal refund note by setting sender as owner
        const refundNote = await createNote(
            (streamNote.k.toNumber() * 3) / 4,
            sender.address,
            [sender.address, recipient.address]
        );

        const badProof = new JoinSplitProof(
            [streamNote],
            [withdrawalNote, refundNote],
            streamUtilitiesMock.address,
            0,
            sender.address
        );
        const badProofData = badProof.encodeABI(zkAsset.address);

        await expect(
            streamUtilitiesMock.processWithdrawal(
                ace.address,
                badProofData,
                withdrawalNote.noteHash,
                streamObject
            )
        ).to.be.revertedWith(
            'change note in 2 is not owned by stream contract'
        );
    });

    // it('reverts if withdraw note is not owned by recipient', async function () {
    //     // Try to steal withdrawal note by setting sender as owner
    //     const badWithdrawalNote = await createNote(
    //         streamNote.k.toNumber() / 4,
    //         sender.address,
    //         [sender.address]
    //     );

    //     const refundNote = await createNote(
    //         (streamNote.k.toNumber() * 3) / 4,
    //         streamUtilitiesMock.address,
    //         [sender.address, recipient.address]
    //     );

    //     const badProof = new JoinSplitProof(
    //         [streamNote],
    //         [badWithdrawalNote, refundNote],
    //         streamUtilitiesMock.address,
    //         0,
    //         sender.address
    //     );

    //     const badProofData = badProof.encodeABI(zkAsset.address);

    //     await expect(
    //         streamUtilitiesMock.processWithdrawal(
    //             ace.address,
    //             badProofData,
    //             badWithdrawalNote.noteHash,
    //             streamObject
    //         )
    //     ).to.be.revertedWith(
    //         'change note in 2 is not owned by stream contract'
    //     );
    // });

    it('reverts if sender does not have view access to the new streamNote', async function () {
        // withdraw 1/4th of note
        const withdrawalNote = await createNote(
            streamNote.k.toNumber() / 4,
            recipient.address,
            [recipient.address]
        );

        // Here the sender has not given themself view access to the note
        const badRefundNote = await createNote(
            (streamNote.k.toNumber() * 3) / 4,
            streamUtilitiesMock.address,
            [recipient.address]
        );

        const badProof = new JoinSplitProof(
            [streamNote],
            [withdrawalNote, badRefundNote],
            streamUtilitiesMock.address,
            0,
            sender.address
        );

        const badProofData = badProof.encodeABI(zkAsset.address);

        await expect(
            streamUtilitiesMock.processWithdrawal(
                ace.address,
                badProofData,
                withdrawalNote.noteHash,
                streamObject
            )
        ).to.be.revertedWith("stream sender can't view new stream note");
    });

    it('reverts if recipient does not have view access to the new streamNote', async function () {
        // withdraw 1/4th of note
        const withdrawalNote = await createNote(
            streamNote.k.toNumber() / 4,
            recipient.address,
            [recipient.address]
        );

        // Here the sender has not given the recipient view access to the note
        const badRefundNote = await createNote(
            (streamNote.k.toNumber() * 3) / 4,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const badProof = new JoinSplitProof(
            [streamNote],
            [withdrawalNote, badRefundNote],
            streamUtilitiesMock.address,
            0,
            sender.address
        );

        const badProofData = badProof.encodeABI(zkAsset.address);

        await expect(
            streamUtilitiesMock.processWithdrawal(
                ace.address,
                badProofData,
                withdrawalNote.noteHash,
                streamObject
            )
        ).to.be.revertedWith("stream recipient can't view new stream note");
    });

    it('transfers the zkAssets to the sender and recipient', async function () {
        const withdrawalNote = await createNote(
            streamNote.k.toNumber() / 4,
            recipient.address,
            [recipient.address]
        );

        const refundNote = await createNote(
            (streamNote.k.toNumber() * 3) / 4,
            streamUtilitiesMock.address,
            [sender.address, recipient.address]
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
            streamUtilitiesMock.processWithdrawal(
                ace.address,
                proofData,
                withdrawalNote.noteHash,
                streamObject
            )
        )
            .to.emit(zkAsset, 'DestroyNote')
            .withArgs(streamUtilitiesMock.address, streamNote.noteHash);
    });

    it('returns the hash of the new stream note');
});
