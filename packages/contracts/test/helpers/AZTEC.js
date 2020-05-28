const { note } = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');

/**
 * Generate a set of notes, given the desired note values and account of the owner
 *
 * @method getNotesForAccount
 * @param {Object} aztecAccount - Ethereum account that owns the notes to be created
 * @param {Number[]} noteValues - array of note values, for which notes will be created
 * @returns {Note[]} - array of notes
 */
const getNotesForAccount = async (aztecAccount, noteValues) => {
    return Promise.all(
        noteValues.map((noteValue) =>
            note.create(aztecAccount.publicKey, noteValue)
        )
    );
};

/**
 * General purpose function that generates a set of notes to be used in a deposit join split proof.
 *
 * There are no inputNotes created in this function - it generates notes for a deposit proof i.e. a joinSplit
 * where tokens are being converted into notes.
 *
 * Output notes are created. The values of these output notes is determined by the input argument
 * depositOutputNoteValues
 *
 * @method getDepositNotes
 * @param {Number[]} depositOutputNoteValues - array of note values, for which notes will be created
 * @param {Number[]} depositOwnerPrivateKey - private key for address which will own the created notes
 * @returns {Note[]} depositInputNotes - input notes for a deposit join split proof
 * @returns {Note[]} depositOutputNotes - output notes for a deposit join split proof
 * @returns {Object[]} depositInputOwnerAccounts - Ethereum accounts of the input note owners
 * @returns {Object[]} depositOutputOwnerAccounts - Ethereum accounts of the output note owners
 */
const getDepositNotes = async (
    depositOutputNoteValues,
    depositOwnerPrivateKey
) => {
    const owner = secp256k1.accountFromPrivateKey(depositOwnerPrivateKey);
    const depositInputNotes = [];
    const depositOutputNotes = await getNotesForAccount(
        owner,
        depositOutputNoteValues
    );
    const depositPublicValue = depositOutputNoteValues.reduce((a, b) => a + b);
    const depositInputOwnerAccounts = [];
    const depositOutputOwnerAccounts = [owner];
    return {
        depositInputNotes,
        depositOutputNotes,
        depositPublicValue,
        depositInputOwnerAccounts,
        depositOutputOwnerAccounts,
    };
};

/**
 * General purpose function that generates a set of notes to be used in a deposit joinSplit proof
 * followed by a transfer joinSplit proof.
 *
 * The scenario is that a deposit proof is being performed, followed by a transfer proof.
 * In the deposit proof, public tokens are being converted into notes.
 *
 * These notes are then the input to a transfer proof, where notes are transferred to a second user.
 * During this proof, some note value is also converted back into public token form and withdrawn.
 *
 * The value of the notes created and involved in the proofs is controlled through the two input arguments:
 * depositOutputNoteValues and transferOutputNoteValues
 *
 * @method getDepositAndTransferNotes
 * @param {Number[]} transferInputNoteValues - output note values for the deposit proof
 * @param {Number[]} transferOutputNoteValues - output note values for the transfer proof
 * @returns {Object[]} depositInputOwnerAccounts - Ethereum accounts of the deposit input note owners
 * @returns {Object[]} depositOutputOwnerAccounts - Ethereum accounts of the deposit output note owners
 * @returns {Note[]} transferInputNotes - inputs for a transfer join split proof
 * @returns {Note[]} transferOutputNotes - output notes for a transfer join split proof
 * @returns {Object[]} transferInputOwnerAccounts - Ethereum accounts of the transfer input note owners
 * @returns {Object[]} transferOutputOwnerAccounts - Ethereum accounts of the transfer output note owners
 * @returns {Note[]} notes - array of all notes created
 * @returns {ownerAccounts} ownerAccounts - Ethereum accounts of the created notes
 */
const getTransferNotes = async (
    transferInputNotes,
    transferOutputNoteValues,
    senderPrivateKey,
    recipientPrivateKey
) => {
    const sender = secp256k1.accountFromPrivateKey(senderPrivateKey);
    const recipient = secp256k1.accountFromPrivateKey(recipientPrivateKey);

    const transferInputOwnerAccounts = new Array(
        transferInputNotes.length
    ).fill(sender);

    const transferOutputNotes = await getNotesForAccount(
        recipient,
        transferOutputNoteValues
    );
    const transferOutputOwnerAccounts = new Array(
        transferOutputNotes.length
    ).fill(recipient);
    return {
        transferInputNotes,
        transferOutputNotes,
        transferInputOwnerAccounts,
        transferOutputOwnerAccounts,
    };
};

module.exports = { getNotesForAccount, getDepositNotes, getTransferNotes };
