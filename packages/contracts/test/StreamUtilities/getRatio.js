const { waffle } = require('@nomiclabs/buidler');
const { use, expect } = require('chai');
const { solidity, createFixtureLoader } = require('ethereum-waffle');
const { DividendProof } = require('aztec.js');
const { StreamUtilitiesFixture } = require('../fixtures');

const { createNote } = require('../helpers/notes/createNote');

use(solidity);

describe('StreamUtilities - getRatio', function () {
    const { provider } = waffle;
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    // eslint-disable-next-line no-unused-vars
    let streamUtilitiesMock;
    beforeEach(async function () {
        ({ streamUtilitiesMock } = await loadFixture(StreamUtilitiesFixture));
    });

    it('returns the correct ratio', async function () {
        // 1 * 1000 = 3 * 333 + 1
        const inputNoteValue = 1000;
        const withdrawNoteValue = 333;
        const remainderNoteValue = 1;
        const ratioNumerator = 1;
        const ratioDenominator = 3;

        // This is defined on the contract
        const scalingFactor = 1000000000;

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

        const ratio = await streamUtilitiesMock.getRatio(badProofData);

        // We flip the ratio as we require an integer value
        const expectedRatio = parseInt(
            (ratioDenominator * scalingFactor) / ratioNumerator,
            10
        );
        expect(ratio).to.be.equal(expectedRatio);
    });
});
