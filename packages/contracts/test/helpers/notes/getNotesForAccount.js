const { createNote } = require('./createNote');

/**
 * Generate a set of notes, given the desired note values and account of the owner
 *
 * @method getNotesForAccount
 * @param {Object} aztecAccount - Ethereum account that owns the notes to be created
 * @param {Number[]} noteValues - array of note values, for which notes will be created
 * @returns {Note[]} - array of notes
 */
const getNotesForAccount = async (address, noteValues) => {
    return Promise.all(
        noteValues.map((noteValue) => createNote(noteValue, address, [address]))
    );
};

module.exports = { getNotesForAccount };
