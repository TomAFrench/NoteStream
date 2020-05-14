const { usePlugin, task } = require("@nomiclabs/buidler/config");

usePlugin("@nomiclabs/buidler-truffle5");
usePlugin("@nomiclabs/buidler-etherscan");
require("dotenv").config({ path: ".env.development" });

task("export", "Exports the contract ABIs", async () => {
  require("./scripts/export.js");
});

module.exports = {
  solc: {
    version: "0.5.15",
    optimizer: {
      enabled: true,
      runs: 200,
    },
    evmVersion: "istanbul",
  },
  // contracts_build_directory: "./build",
  mocha: {
    bail: true,
    enableTimeouts: false,
    reporter: "spec",
  },
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 4,
      from: process.env.TESTING_ACCOUNT_ADDRESS,
      accounts: [process.env.TESTING_ACCOUNT],
      // gas: 5500000,
      gasPrice: 10000000000,
    },
  },
  etherscan: {
    url: "https://api-rinkeby.etherscan.io/api",
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
