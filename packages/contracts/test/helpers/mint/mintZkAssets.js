const { JoinSplitProof } = require('aztec.js');
const { getDepositNotes } = require('./getDepositNotes');

const mintZkAsset = async (recipientAddress, amount, token, zkAsset, ace) => {
    const signerAddress = token.signer.address;
    // Mint public tokens and give ACE access to move them
    await token.mint(signerAddress, amount);
    await token.approve(ace.address, amount);

    const {
        depositInputNotes,
        depositOutputNotes,
        depositPublicValue,
    } = await getDepositNotes([amount], recipientAddress);
    const publicValue = depositPublicValue * -1;

    const proof = new JoinSplitProof(
        depositInputNotes,
        depositOutputNotes,
        signerAddress,
        publicValue,
        signerAddress
    );
    const data = proof.encodeABI(zkAsset.address);

    // Approve ACE to spend tokens held by the zkAsset contract
    await ace.publicApprove(zkAsset.address, proof.hash, amount);

    // Note: As there are no input notes we can use an empty signature
    await zkAsset['confidentialTransfer(bytes,bytes)'](data, '0x');

    return depositOutputNotes[0];
};

module.exports = { mintZkAsset };
