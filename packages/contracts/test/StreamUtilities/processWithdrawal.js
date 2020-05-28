const { use } = require('chai');
const {
    solidity,
    MockProvider,
    createFixtureLoader,
} = require('ethereum-waffle');
const { StreamUtilitiesFixture } = require('../fixtures');

use(solidity);

describe('StreamUtilities - processWithdrawal', function () {
    const provider = new MockProvider();
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    // eslint-disable-next-line no-unused-vars
    let streamUtilitiesMock;
    beforeEach(async function () {
        ({ streamUtilitiesMock } = await loadFixture(StreamUtilitiesFixture));
    });

    it('reverts if new streamNote is not owned by NoteStream contract');
    it('reverts if withdraw note is not owned by recipient');
    it('reverts if sender does not have view access to the new streamNote');
    it('reverts if recipient does not have view access to the new streamNote');
    it('emits a confidentialTransfer event');
    it('returns the hash of the first output note');
});
