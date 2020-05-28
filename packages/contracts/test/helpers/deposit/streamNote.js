const { JoinSplitProof } = require('aztec.js');
const { createNote } = require('../notes/createNote');

/**
 * Generate a note such that would be owned by the NoteStream contract, given the desired note value and stream sender/recipients
 *
 * @method getStreamNote
 * @param {Number} noteValue - Number representing note value
 * @param {Object} sender - Ethereum account that initiated the stream
 * @param {Object} recipient - Ethereum account that is receiving the stream
 * @returns {Note} - stream note
 */
const getStreamNote = (noteValue, noteOwner, sender, recipient) => {
    return createNote(noteValue, noteOwner, [sender, recipient]);
};

const createStreamDepositProof = async (
    inputNotes,
    noteOwner,
    sender,
    recipient,
    publicValue
) => {
    // console.log(sender, recipient);
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
        sender,
        publicValue,
        sender
    );
    return {
        depositProof,
        depositInputOwnerAccounts,
        streamNote,
    };
};

module.exports = { getStreamNote, createStreamDepositProof };
