const { getNotesForAccount } = require('../notes/getNotesForAccount');

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
    depositOwnerAddress
) => {
    const depositInputNotes = [];
    const depositOutputNotes = await getNotesForAccount(
        depositOwnerAddress,
        depositOutputNoteValues
    );
    const depositPublicValue = depositOutputNoteValues.reduce((a, b) => a + b);
    const depositInputOwnerAccounts = [];
    const depositOutputOwnerAccounts = [depositOwnerAddress];
    return {
        depositInputNotes,
        depositOutputNotes,
        depositPublicValue,
        depositInputOwnerAccounts,
        depositOutputOwnerAccounts,
    };
};

module.exports = { getDepositNotes };
