const fs = require('fs')
const path = require('path')
const contracts = path.resolve(__dirname, '../build/contracts/')
const abiDirectory = path.resolve(__dirname, '../src/abis/')

module.exports = async function() {
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
}