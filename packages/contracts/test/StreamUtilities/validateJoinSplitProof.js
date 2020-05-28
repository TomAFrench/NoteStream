const { waffle } = require('@nomiclabs/buidler');
const { use, expect } = require('chai');
const { solidity, createFixtureLoader } = require('ethereum-waffle');
const { JoinSplitProof } = require('aztec.js');
const { StreamUtilitiesFixture } = require('../fixtures');
const { createNote } = require('../helpers/notes/createNote');

use(solidity);

describe('StreamUtilities - validateJoinSplitProof', function () {
    const { provider } = waffle;
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    let ace;
    let streamUtilitiesMock;
    let zkAsset;
    let streamObjectTemplate;
    beforeEach(async function () {
        ({ ace, streamUtilitiesMock, zkAsset } = await loadFixture(
            StreamUtilitiesFixture
        ));
        streamObjectTemplate = {
            startTime: 0,
            lastWithdrawTime: 50,
            stopTime: 100,
            recipient: recipient.address,
            sender: sender.address,
            tokenAddress: zkAsset.address,
            isEntity: true,
        };
    });

    it('reverts if proof has a non-zero public value transfer', async function () {
        const inputNoteValue = 1000;
        const outputNoteValue = 250;
        const publicValue = 500;

        const inputNote = await createNote(
            inputNoteValue,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const outputNote1 = await createNote(outputNoteValue, sender.address, [
            sender.address,
        ]);

        const outputNote2 = await createNote(
            outputNoteValue,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const badProof = new JoinSplitProof(
            [inputNote],
            [outputNote1, outputNote2],
            streamUtilitiesMock.address,
            publicValue,
            sender.address
        );
        const badProofData = badProof.encodeABI(zkAsset.address);

        const streamObject = {
            ...streamObjectTemplate,
            noteHash: inputNote.noteHash,
        };

        await expect(
            streamUtilitiesMock.validateJoinSplitProof(
                ace.address,
                badProofData,
                outputNote1.noteHash,
                streamObject
            )
        ).to.be.revertedWith('nonzero public value transfer');
    });

    it('reverts if proof does not have one input note only', async function () {
        const inputNoteValue = 1000;

        const inputNote1 = await createNote(
            inputNoteValue,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const inputNote2 = await createNote(
            inputNoteValue,
            streamUtilitiesMock.address,
            [sender.address]
        );

        // We only use one output note as we exect the function to revert before it's checked
        const outputNote = await createNote(
            2 * inputNoteValue,
            sender.address,
            [sender.address]
        );

        const badProofData = new JoinSplitProof(
            [inputNote1, inputNote2],
            [outputNote],
            streamUtilitiesMock.address,
            0,
            sender.address
        ).encodeABI(zkAsset.address);

        const streamObject = {
            ...streamObjectTemplate,
            noteHash: inputNote1.noteHash,
        };

        await expect(
            streamUtilitiesMock.validateJoinSplitProof(
                ace.address,
                badProofData,
                outputNote.noteHash,
                streamObject
            )
        ).to.be.revertedWith('Incorrect number of input notes');
    });

    it('reverts if proof does not have two output notes only', async function () {
        const noteValue = 1000;

        const inputNote = await createNote(
            noteValue,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const outputNote = await createNote(noteValue, sender.address, [
            sender.address,
        ]);

        const badProofData = new JoinSplitProof(
            [inputNote],
            [outputNote],
            streamUtilitiesMock.address,
            0,
            sender.address
        ).encodeABI(zkAsset.address);

        const streamObject = {
            ...streamObjectTemplate,
            noteHash: inputNote.noteHash,
        };

        await expect(
            streamUtilitiesMock.validateJoinSplitProof(
                ace.address,
                badProofData,
                outputNote.noteHash,
                streamObject
            )
        ).to.be.revertedWith('Incorrect number of output notes');
    });

    it('reverts if proof does not use same withdraw note as dividend proof', async function () {
        const inputNoteValue = 1000;
        const outputNoteValue = 500;

        const inputNote = await createNote(
            inputNoteValue,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const outputNote1 = await createNote(outputNoteValue, sender.address, [
            sender.address,
        ]);

        const outputNote2 = await createNote(
            outputNoteValue,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const badProofData = new JoinSplitProof(
            [inputNote],
            [outputNote1, outputNote2],
            streamUtilitiesMock.address,
            0,
            sender.address
        ).encodeABI(zkAsset.address);

        const streamObject = {
            ...streamObjectTemplate,
            noteHash: inputNote.noteHash,
        };

        // Here we pass the hash of outputNote2
        // To be a valid proof we should have usedoutputNote1
        await expect(
            streamUtilitiesMock.validateJoinSplitProof(
                ace.address,
                badProofData,
                outputNote2.noteHash,
                streamObject
            )
        ).to.be.revertedWith('withdraw note in 2 is not the same as 1');
    });

    it('reverts if proof does not use stream note as input', async function () {
        const inputNoteValue = 1000;
        const outputNoteValue = 500;

        const inputNote = await createNote(
            inputNoteValue,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const outputNote1 = await createNote(outputNoteValue, sender.address, [
            sender.address,
        ]);

        const outputNote2 = await createNote(
            outputNoteValue,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const badProofData = new JoinSplitProof(
            [inputNote],
            [outputNote1, outputNote2],
            streamUtilitiesMock.address,
            0,
            sender.address
        ).encodeABI(zkAsset.address);

        const streamObject = {
            ...streamObjectTemplate,
            // Here we pass the output note hash as the stream note hash
            // This should invalidate the proof.
            noteHash: outputNote1.noteHash,
        };

        await expect(
            streamUtilitiesMock.validateJoinSplitProof(
                ace.address,
                badProofData,
                outputNote1.noteHash,
                streamObject
            )
        ).to.be.revertedWith('stream note in 2 is not correct');
    });

    it('returns output notes of proof');
});
