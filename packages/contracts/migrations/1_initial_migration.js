/* global artifacts */
const Migrations = artifacts.require('./Migrations.sol');

module.exports = async (deployer) => {
  const migrations = await Migrations.new();
  Migrations.setAsDeployed(migrations);
};
