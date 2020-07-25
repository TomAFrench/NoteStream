const { waffle } = require('@nomiclabs/buidler');
const { use, expect } = require('chai');
const { solidity, createFixtureLoader } = require('ethereum-waffle');
const { JoinSplitProof } = require('aztec.js');

const { StreamUtilitiesFixture } = require('../fixtures');
const { mintZkAsset } = require('../helpers/mint/mintZkAssets');
const { createNote } = require('../helpers/notes/createNote');
const {
    getStreamNote,
    createStreamDepositProof,
} = require('../helpers/deposit/streamNote');
const { signProof } = require('../helpers/signProof');

use(solidity);

describe('StreamUtilities - processDeposit', function () {
    const { provider } = waffle;
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    let ace;
    let token;
    let zkAsset;
    let depositOutputNote;
    let streamUtilitiesMock;
    const streamDeposit = 100000;
    beforeEach(async function () {
        ({
            ace,
            streamUtilitiesMock,
            token,
            zkAsset,
            // depositOutputNotes,
        } = await loadFixture(StreamUtilitiesFixture));

        depositOutputNote = await mintZkAsset(
            sender.address,
            streamDeposit,
            token,
            zkAsset,
            ace
        );
    });

    it('reverts if there is no output note', async function () {
        const badProof = new JoinSplitProof(
            [depositOutputNote],
            [],
            sender.address,
            streamDeposit,
            sender.address
        );
        const { data, signature } = signProof(
            zkAsset,
            badProof,
            streamUtilitiesMock.address,
            sender.signingKey.privateKey
        );

        await expect(
            streamUtilitiesMock.processDeposit(
                data,
                signature,
                ace.address,
                sender.address,
                recipient.address,
                zkAsset.address
            )
        ).to.be.revertedWith('Incorrect number of output notes');
    });
    it('reverts if there is more than one output note', async function () {
        const note1 = await getStreamNote(
            streamDeposit / 2,
            streamUtilitiesMock.address,
            sender.address,
            recipient.address
        );
        const note2 = await getStreamNote(
            streamDeposit / 2,
            streamUtilitiesMock.address,
            sender.address,
            recipient.address
        );

        const badProof = new JoinSplitProof(
            [depositOutputNote],
            [note1, note2],
            sender.address,
            0,
            sender.address
        );

        const { data, signature } = signProof(
            zkAsset,
            badProof,
            streamUtilitiesMock.address,
            sender.signingKey.privateKey
        );

        await expect(
            streamUtilitiesMock.processDeposit(
                data,
                signature,
                ace.address,
                sender.address,
                recipient.address,
                zkAsset.address
            )
        ).to.be.revertedWith('Incorrect number of output notes');
    });
    it('reverts if streamNote is not owned by the contract', async function () {
        const badNote = await getStreamNote(
            streamDeposit,
            sender.address,
            sender.address,
            recipient.address
        );

        const badProof = new JoinSplitProof(
            [depositOutputNote],
            [badNote],
            sender.address,
            0,
            sender.address
        );

        const { data, signature } = signProof(
            zkAsset,
            badProof,
            streamUtilitiesMock.address,
            sender.signingKey.privateKey
        );

        await expect(
            streamUtilitiesMock.processDeposit(
                data,
                signature,
                ace.address,
                sender.address,
                recipient.address,
                zkAsset.address
            )
        ).to.be.revertedWith('stream note is not owned by stream contract');
    });
    it('reverts if sender does not have view access to the streamNote', async function () {
        const badNote = await createNote(
            streamDeposit,
            streamUtilitiesMock.address,
            [recipient.address]
        );

        const badProof = new JoinSplitProof(
            [depositOutputNote],
            [badNote],
            sender.address,
            0,
            sender.address
        );

        const { data, signature } = signProof(
            zkAsset,
            badProof,
            streamUtilitiesMock.address,
            sender.signingKey.privateKey
        );

        await expect(
            streamUtilitiesMock.processDeposit(
                data,
                signature,
                ace.address,
                sender.address,
                recipient.address,
                zkAsset.address
            )
        ).to.be.revertedWith("stream sender can't view stream note");
    });
    it('reverts if recipient does not have view access to the streamNote', async function () {
        const badNote = await createNote(
            streamDeposit,
            streamUtilitiesMock.address,
            [sender.address]
        );

        const badProof = new JoinSplitProof(
            [depositOutputNote],
            [badNote],
            sender.address,
            0,
            sender.address
        );

        const { data, signature } = signProof(
            zkAsset,
            badProof,
            streamUtilitiesMock.address,
            sender.signingKey.privateKey
        );

        await expect(
            streamUtilitiesMock.processDeposit(
                data,
                signature,
                ace.address,
                sender.address,
                recipient.address,
                zkAsset.address
            )
        ).to.be.revertedWith("stream recipient can't view stream note");
    });
    it('transfers the zkAssets to the contract and returns the new stream note hash', async function () {
        const { depositProof, streamNote } = await createStreamDepositProof(
            [depositOutputNote],
            streamUtilitiesMock.address,
            sender.address,
            recipient.address,
            0
        );

        const { data, signature } = signProof(
            zkAsset,
            depositProof,
            streamUtilitiesMock.address,
            sender.signingKey.privateKey
        );
        await expect(
            streamUtilitiesMock.processDeposit(
                data,
                signature,
                ace.address,
                sender.address,
                recipient.address,
                zkAsset.address
            )
        )
            .to.emit(zkAsset, 'DestroyNote')
            .withArgs(sender.address, depositOutputNote.noteHash)
            .and.emit(streamUtilitiesMock, 'ProcessDeposit')
            .withArgs(streamNote.noteHash);
    });
});
