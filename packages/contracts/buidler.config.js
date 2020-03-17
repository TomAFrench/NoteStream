usePlugin("@nomiclabs/buidler-truffle5");
usePlugin("@nomiclabs/buidler-etherscan");
require('dotenv').config({ path: '.env.development' });

const fs = require('fs')
const path = require('path')
const contracts = path.resolve(__dirname, './artifacts/')
const abiDirectory = path.resolve(__dirname, './src/abis/')

// This is a sample Buidler task. To learn how to create your own go to
// https://buidler.dev/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await web3.eth.getAccounts();

  for (const account of accounts) {
    console.log(account);
  }
});

task("export_abi", "Exports the built ABIs", async () => {
  let builtContracts = fs.readdirSync(contracts)
    // loop over every contract
    builtContracts.forEach(contract => {
        // Get the JSON for a specific contract
        let json = JSON.parse(fs.readFileSync(path.resolve(contracts, contract)))
        // Extract just the abi
        let { abi } = json
        // Write the abi to a new file in the ABI directory
        fs.writeFileSync(path.resolve(abiDirectory, contract), JSON.stringify(abi))
    });
});

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
  // contracts_build_directory: "./build",
  mocha: {
    bail: true,
    enableTimeouts: false,
    reporter: 'spec',
  },
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 4,
      from: process.env.GANACHE_TESTING_ACCOUNT_0_ADDRESS,
      accounts: [
        process.env.GANACHE_TESTING_ACCOUNT_0
      ],
      gas: 5500000,
      gasPrice: 10000000000,
    },
  },
  etherscan: {
    url: "https://api-rinkeby.etherscan.io/api",
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};