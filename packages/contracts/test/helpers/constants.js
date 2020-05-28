// Adding an address to the metadata requires a public key however as we are not decrypting notes from the registry
// we do not need to use a proper public key. We then use a constant dummy value.
const dummyLinkedPublicKey =
    '0xa61d17b0dd3095664d264628a6b947721314b6999aa6a73d3c7698f041f78a4d';

module.exports = { dummyLinkedPublicKey };
