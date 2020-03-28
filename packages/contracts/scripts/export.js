const fs = require('fs')
const path = require('path')
const contracts = path.resolve(__dirname, '../artifacts/')
const abiDirectory = path.resolve(__dirname, '../../contract-artifacts/abis/')
const subgraphAbiDirectory = path.resolve(__dirname, '../../subgraph/abis/')

const builtContracts = [
  "AztecStreamer.json"
]

async function main() {  
  // loop over every contract
  builtContracts.forEach(contract => {
      console.log(contract)
      // Get the JSON for a specific contract
      const json = JSON.parse(fs.readFileSync(path.resolve(contracts, contract)))
      // Extract just the abi
      const { abi } = json
      // Write the abi to a new file in the ABI directory
      fs.writeFileSync(path.resolve(abiDirectory, contract), JSON.stringify(abi, null, 2))
      fs.writeFileSync(path.resolve(subgraphAbiDirectory, contract), JSON.stringify(abi, null, 2))
  });
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });