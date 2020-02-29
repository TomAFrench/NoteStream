const HDWalletProvider = require('truffle-hdwallet-provider');
require('dotenv').config({ path: '.env.development' });

module.exports = {
  compilers: {
    solc: {
      version: '^0.5.11',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: 'constantinople',
      },
    },
  },
  contracts_build_directory: "./build",
  mocha: {
    bail: true,
    enableTimeouts: false,
    reporter: 'spec',
  },
  networks: {
    development: {
      host: '127.0.0.1',
      gas: 6500000,
      network_id: '*', // eslint-disable-line camelcase
      port: 8545,
    },
    rinkeby: {
      provider() {
        return new HDWalletProvider(
          process.env.GANACHE_TESTING_ACCOUNT_0_MNEMONIC,
          `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
        );
      },
      network_id: 4,
      gas: 5500000,
      gasPrice: 10000000000,
      confirmations: 2,
      skipDryRun: true,
    },
  },
}; 