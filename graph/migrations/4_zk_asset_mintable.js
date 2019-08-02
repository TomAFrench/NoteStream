/* global artifacts */
const devUtils = require('@aztec/dev-utils');
const ACE = artifacts.require('@aztec/protocol/contracts/ACE/ACE.sol');
const ERC20Mintable = artifacts.require('@aztec/protocol/contracts/ERC20/ERC20Mintable.sol');
const ZkAssetMintable = artifacts.require('@aztec/protocol/contracts/ERC1724/ZkAssetMintable.sol');

const {
    JOIN_SPLIT_PROOF,
    MINT_PROOF,
} = devUtils.proofs;

module.exports = async (deployer) => {
    const ERC20Contract = await deployer.deploy(ERC20Mintable);

    const scalingFactor = 1;
    const ZkAssetContract = await deployer.deploy(
        ZkAssetMintable,
        ACE.address,
        ERC20Mintable.address,
        scalingFactor,
    );
    await ZkAssetContract.setProofs(1, 17);
};
