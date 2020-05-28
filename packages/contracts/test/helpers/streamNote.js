const { note, JoinSplitProof } = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');

/**
 * Generate a note such that would be owned by the NoteStream contract, given the desired note value and stream sender/recipients
 *
 * @method getStreamNote
 * @param {Number} noteValue - Number representing note value
 * @param {Object} sender - Ethereum account that initiated the stream
 * @param {Object} recipient - Ethereum account that is receiving the stream
 * @returns {Note} - stream note
 */
const getStreamNote = async (noteValue, noteOwner, sender, recipient) => {
    return note.create(
        secp256k1.generateAccount().publicKey,
        noteValue,
        [
            {
                address: sender.address,
                linkedPublicKey: sender.publicKey,
            },
            {
                address: recipient.address,
                linkedPublicKey: recipient.publicKey,
            },
        ],
        noteOwner
    );
};

const createStreamDepositProof = async (
    inputNotes,
    noteOwner,
    senderPrivateKey,
    recipientPrivateKey,
    publicValue
) => {
    const sender = secp256k1.accountFromPrivateKey(senderPrivateKey);
    const recipient = secp256k1.accountFromPrivateKey(recipientPrivateKey);
    console.log(sender, recipient);
    const depositInputOwnerAccounts = new Array(inputNotes.length).fill(sender);

    const noteValue = inputNotes
        .map((noteObj) => noteObj.k.toNumber())
        .reduce((a, b) => a + b, 0);

    const streamNote = await getStreamNote(
        noteValue,
        noteOwner,
        sender,
        recipient
    );
    const depositProof = new JoinSplitProof(
        inputNotes,
        [streamNote],
        sender.address,
        publicValue,
        sender.address
    );
    return {
        depositProof,
        depositInputOwnerAccounts,
    };
};

module.exports = { getStreamNote, createStreamDepositProof };
