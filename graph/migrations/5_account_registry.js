const AZTECAccountRegistry = artifacts.require('./AZTECAccountRegistry.sol');

module.exports = async (deployer) => {

   const a =  await deployer.deploy(
        AZTECAccountRegistry,
        1563886150337,
   );
    console.log(a);
};
