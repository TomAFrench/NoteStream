// const { devConstants } = require("@notestream/dev-utils");
const { waffle } = require('@nomiclabs/buidler');
const { use, expect } = require('chai');
const { solidity, createFixtureLoader } = require('ethereum-waffle');
const { bigNumberify } = require('ethers/utils');

const { noteStreamFixture } = require('../fixtures');

use(solidity);

// eslint-disable-next-line no-undef
describe('NoteStream - getStream', function () {
    const { provider } = waffle;
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    let noteStream;
    beforeEach(async function () {
        ({ noteStream } = await loadFixture(noteStreamFixture));
    });

    it('reverts when the stream does not exist', async function () {
        const streamId = bigNumberify(419863);
        await expect(noteStream.getStream(streamId)).to.be.revertedWith(
            'stream does not exist'
        );
    });
});
