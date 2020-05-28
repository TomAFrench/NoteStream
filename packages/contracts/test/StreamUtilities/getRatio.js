const { use } = require('chai');
const {
    solidity,
    MockProvider,
    createFixtureLoader,
} = require('ethereum-waffle');
const { StreamUtilitiesFixture } = require('../fixtures');

use(solidity);

describe('StreamUtilities - getRatio', function () {
    const provider = new MockProvider();
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    // eslint-disable-next-line no-unused-vars
    let streamUtilitiesMock;
    beforeEach(async function () {
        ({ streamUtilitiesMock } = await loadFixture(StreamUtilitiesFixture));
    });

    it('returns the correct ratio');
});
