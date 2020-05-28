const { waffle } = require('@nomiclabs/buidler');
const { use, expect } = require('chai');
const { solidity, createFixtureLoader } = require('ethereum-waffle');
const { DividendProof } = require('aztec.js');
const { createNote } = require('../helpers/notes/createNote');
const { StreamUtilitiesFixture } = require('../fixtures');

use(solidity);

describe('StreamUtilities - validateRatioProof', function () {
    const { provider } = waffle;
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    let ace;
    let streamUtilitiesMock;
    let streamObjectTemplate;
    let zkAsset;
    beforeEach(async function () {
        ({ ace, streamUtilitiesMock, zkAsset } = await loadFixture(
            StreamUtilitiesFixture
        ));
        streamObjectTemplate = {
            recipient: recipient.address,
            sender: sender.address,
            tokenAddress: zkAsset.address,
            isEntity: true,
        };
    });

    it('reverts if proof ratio does not match withdrawal duration', async function () {
        const inputNoteValue = 1000;

        const streamTotalDuration = 100;
        const withdrawalDuration = 10;

        // We may then withdraw 1/10th of the note's value, i.e. 100
        // Instead we try to take half
        const withdrawNoteValue = 500;
        const remainderNoteValue = 0;
        const ratioNumerator = 1;
        const ratioDenominator = 2;

        const inputNote = await createNote(
            inputNoteValue,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const withdrawNote = await createNote(
            withdrawNoteValue,
            sender.address,
            [sender.address]
        );

        const remainderNote = await createNote(
            remainderNoteValue,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const badProofData = new DividendProof(
            inputNote,
            remainderNote,
            withdrawNote,
            streamUtilitiesMock.address,
            ratioDenominator,
            ratioNumerator
        ).encodeABI();

        const streamObject = {
            ...streamObjectTemplate,
            noteHash: inputNote.noteHash,
            startTime: 0,
            lastWithdrawTime: 0,
            stopTime: streamTotalDuration,
        };

        await expect(
            streamUtilitiesMock.validateRatioProof(
                ace.address,
                badProofData,
                withdrawalDuration,
                streamObject
            )
        ).to.be.revertedWith('ratios do not match');
    });

    it('reverts if proof does not use stream note as source', async function () {
        const inputNoteValue = 1000;

        const streamTotalDuration = 100;
        const withdrawalDuration = 10;

        // We may then withdraw 1/10th of the note's value, i.e. 100
        const withdrawNoteValue = 100;
        const remainderNoteValue = 0;
        const ratioNumerator = 1;
        const ratioDenominator = 10;

        const inputNote = await createNote(
            inputNoteValue,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const withdrawNote = await createNote(
            withdrawNoteValue,
            sender.address,
            [sender.address]
        );

        const remainderNote = await createNote(
            remainderNoteValue,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const badProofData = new DividendProof(
            inputNote,
            remainderNote,
            withdrawNote,
            streamUtilitiesMock.address,
            ratioDenominator,
            ratioNumerator
        ).encodeABI();

        const streamObject = {
            ...streamObjectTemplate,
            noteHash: withdrawNote.noteHash,
            startTime: 0,
            lastWithdrawTime: 0,
            stopTime: streamTotalDuration,
        };

        await expect(
            streamUtilitiesMock.validateRatioProof(
                ace.address,
                badProofData,
                withdrawalDuration,
                streamObject
            )
        ).to.be.revertedWith('incorrect notional note in proof 1');
    });

    it('returns withdrawal note hash');
});
