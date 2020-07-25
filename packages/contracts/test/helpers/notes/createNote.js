const { note } = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');
const { dummyLinkedPublicKey } = require('../constants');

const createNote = (noteValue, noteOwner, access) => {
    return note.create(
        secp256k1.generateAccount().publicKey,
        noteValue,
        access.map((address) => ({
            address,
            linkedPublicKey: dummyLinkedPublicKey,
        })),
        noteOwner
    );
};

module.exports = { createNote };
