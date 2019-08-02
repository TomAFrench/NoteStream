/* global artifacts */
const devUtils = require('@aztec/dev-utils');
const ACE = artifacts.require('@aztec/protocol/contracts/ACE/ACE.sol');
const ERC20Mintable = artifacts.require('@aztec/protocol/contracts/ERC20/ERC20Mintable.sol');
const ZkAssetOwnable = artifacts.require('@aztec/protocol/contracts/ERC1724/ZkAssetOwnable.sol');

const {
    JOIN_SPLIT_PROOF,
    MINT_PROOF,
} = devUtils.proofs;

module.exports = async (deployer) => {
    const ERC20Contract = await deployer.deploy(ERC20Mintable);

    const scalingFactor = 1;
    const ZkAssetContract = await deployer.deploy(
        ZkAssetOwnable,
        ACE.address,
        ERC20Contract.address,
        scalingFactor,
    );
    await ZkAssetContract.setProofs(1, 17);
};
