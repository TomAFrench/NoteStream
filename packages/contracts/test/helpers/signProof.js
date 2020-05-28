const { signer } = require('aztec.js');

const signProof = (zkAsset, proof, spender, privateKey) => {
    const data = proof.encodeABI(zkAsset.address);
    const signature = signer.signApprovalForProof(
        zkAsset.address,
        proof.eth.outputs,
        spender,
        true,
        privateKey
    );
    return { data, signature };
};

module.exports = { signProof };
