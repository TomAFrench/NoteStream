const { use, expect } = require('chai');
const { solidity, MockProvider, deployContract } = require('ethereum-waffle');

const { devConstants } = require('@notestream/dev-utils');
const NoteStream = require('../../build/NoteStream.json');

const { ZERO_ADDRESS } = devConstants;

use(solidity);

// eslint-disable-next-line no-undef
describe('NoteStream - constructor', function () {
    const provider = new MockProvider();
    const [deployer] = provider.getWallets();

    it('reverts when the ACE contract is the zero address', async function () {
        await expect(
            deployContract(deployer, NoteStream, [ZERO_ADDRESS])
        ).to.be.revertedWith('ACE contract is the zero address');
    });
});
