const { waffle } = require('@nomiclabs/buidler');
const { use } = require('chai');
const { solidity, createFixtureLoader } = require('ethereum-waffle');
const { signer, JoinSplitProof } = require('aztec.js');

const { StreamUtilitiesFixture } = require('../fixtures');
const { getDepositNotes } = require('../helpers/AZTEC');
const { createStreamDepositProof } = require('../helpers/streamNote');

use(solidity);

describe.only('StreamUtilities - processDeposit', function () {
    const { provider } = waffle;
    const [sender, recipient] = provider.getWallets();
    const loadFixture = createFixtureLoader(provider, [sender, recipient]);

    let ace;
    let token;
    let zkAsset;
    // let depositOutputNotes;
    let data;
    let signature;
    let streamUtilitiesMock;
    beforeEach(async function () {
        ({
            ace,
            streamUtilitiesMock,
            token,
            zkAsset,
            // depositOutputNotes,
        } = await loadFixture(StreamUtilitiesFixture));

        const depositAmount = '10000000000000';

        await token.mint(sender.address, depositAmount);
        await token.approve(ace.address, depositAmount);

        const {
            depositInputNotes,
            depositOutputNotes,
            depositPublicValue,
            depositInputOwnerAccounts,
        } = await getDepositNotes([100000], sender.signingKey.privateKey);
        const publicValue = depositPublicValue * -1;

        const proof = new JoinSplitProof(
            depositInputNotes,
            depositOutputNotes,
            sender.address,
            publicValue,
            sender.address
        );
        const data1 = proof.encodeABI(zkAsset.address);
        const signatures = proof.constructSignatures(
            zkAsset.address,
            depositInputOwnerAccounts
        );

        // Approve ACE to spend tokens held by the zkAsset contract
        await ace.publicApprove(zkAsset.address, proof.hash, 100000);

        // convert some of sender's assets to zkAssets
        await zkAsset['confidentialTransfer(bytes,bytes)'](data1, signatures);

        // At this point the output note should be written onchain in the note registry

        const { depositProof } = await createStreamDepositProof(
            [depositOutputNotes[0]],
            streamUtilitiesMock.address,
            sender.signingKey.privateKey,
            recipient.signingKey.privateKey,
            0
        );

        data = depositProof.encodeABI(zkAsset.address);
        signature = signer.signApprovalForProof(
            zkAsset.address,
            depositProof.eth.outputs,
            streamUtilitiesMock.address,
            true,
            sender.signingKey.privateKey
        );
    });

    it('reverts if there is no output note');
    it('reverts if there is more than one output note');
    it('reverts if streamNote is not owned by the contract');
    it('reverts if sender does not have view access to the streamNote');
    it('reverts if recipient does not have view access to the streamNote');
    it('returns the output note hash', async function () {
        await streamUtilitiesMock.processDeposit(
            data,
            signature,
            ace.address,
            sender.address,
            recipient.address,
            zkAsset.address
        );
    });
});
