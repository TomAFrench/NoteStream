const { getNotesForAccount } = require('../notes/getNotesForAccount');

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
 * @param {Number[]} transferInputNoteValues - output note values for the deposit proof
 * @param {Number[]} transferOutputNoteValues - output note values for the transfer proof
 * @returns {Note[]} transferInputNotes - inputs for a transfer join split proof
 * @returns {Note[]} transferOutputNotes - output notes for a transfer join split proof
 * @returns {Object[]} transferInputOwnerAccounts - Ethereum accounts of the transfer input note owners
 * @returns {Object[]} transferOutputOwnerAccounts - Ethereum accounts of the transfer output note owners
 */
const getTransferNotes = async (
    transferInputNotes,
    transferOutputNoteValues,
    senderAddress,
    recipientAddress
) => {
    const transferInputOwnerAccounts = new Array(
        transferInputNotes.length
    ).fill(senderAddress);

    const transferOutputNotes = await getNotesForAccount(
        recipientAddress,
        transferOutputNoteValues
    );
    const transferOutputOwnerAccounts = new Array(
        transferOutputNotes.length
    ).fill(recipientAddress);
    return {
        transferInputNotes,
        transferOutputNotes,
        transferInputOwnerAccounts,
        transferOutputOwnerAccounts,
    };
};

module.exports = { getTransferNotes };
