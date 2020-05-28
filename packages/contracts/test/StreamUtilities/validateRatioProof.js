const { waffle } = require('@nomiclabs/buidler');
const { use } = require('chai');
const { solidity, createFixtureLoader } = require('ethereum-waffle');
const { StreamUtilitiesFixture } = require('../fixtures');

use(solidity);

describe('StreamUtilities - validateRatioProof', function () {
    const { provider } = waffle;
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    // eslint-disable-next-line no-unused-vars
    let streamUtilitiesMock;
    beforeEach(async function () {
        ({ streamUtilitiesMock } = await loadFixture(StreamUtilitiesFixture));
    });

    it('reverts if proof ratio does not match withdrawal duration');
    it('reverts if proof does not use stream note as source');
    it('returns input and output notes of proof');
});
