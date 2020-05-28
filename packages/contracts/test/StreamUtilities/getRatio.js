const { waffle } = require('@nomiclabs/buidler');
const { use } = require('chai');
const { solidity, createFixtureLoader } = require('ethereum-waffle');
const { StreamUtilitiesFixture } = require('../fixtures');

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

    it('returns the correct ratio');
});
