const { waffle } = require('@nomiclabs/buidler');
const { use } = require('chai');
const { solidity, createFixtureLoader } = require('ethereum-waffle');
const { StreamUtilitiesFixture } = require('../fixtures');

use(solidity);

describe('StreamUtilities - validateJoinSplitProof', function () {
    const { provider } = waffle;
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    // eslint-disable-next-line no-unused-vars
    let streamUtilitiesMock;
    beforeEach(async function () {
        ({ streamUtilitiesMock } = await loadFixture(StreamUtilitiesFixture));
    });

    it('reverts if proof has a non-zero public value transfer');
    it('reverts if proof does not have one input note only');
    it('reverts if proof does not have two output notes only');
    it('reverts if proof does not use same withdraw note as dividend proof');
    it('reverts if proof does not use stream note as input');
    it('returns output notes of proof');
});
