const fs = require("fs-extra");
const path = require("path");
const yaml = require("js-yaml");

const { t } = require("typy");

function getNetworkNameForSubgraph() {
  switch (process.env.SUBGRAPH) {
    case undefined:
    case "tomafrench/notestream":
      return "mainnet";
    case "tomafrench/notestream-goerli":
      return "goerli";
    case "tomafrench/notestream-kovan":
      return "kovan";
    case "tomafrench/notestream-rinkeby":
      return "rinkeby";
    case "tomafrench/notestream-ropsten":
      return "ropsten";
    case "tomafrench/notestream-local":
      return "local";
    default:
      return null;
  }
}

(async () => {
  const networkName = process.env.NETWORK_NAME || getNetworkNameForSubgraph();
  const addressesDirectory = path.join(__dirname, "../contract-artifacts/addresses/");
  const addressesFilePath = path.join(addressesDirectory, `${networkName}.json`);
  const addresses = JSON.parse(await fs.readFile(addressesFilePath, { encoding: "utf-8" }))
  
  const networksFilePath = path.join(__dirname, "networks.yaml");
  const networks = yaml.load(await fs.readFile(networksFilePath, { encoding: "utf-8" }));

  const network = t(networks, networkName).safeObject;
  if (t(network).isFalsy) {
    throw new Error('Please set either a "NETWORK_NAME" or a "SUBGRAPH" environment variable');
  }

  network.contracts.AztecStreamer.address = addresses.AztecStreamer
  await fs.writeFile(networksFilePath, yaml.safeDump(networks));

  console.log("🎉 networks.yaml successfully updated");
})();
