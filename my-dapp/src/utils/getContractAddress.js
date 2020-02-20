export default function getContractAddress(contractName, currentNetwork = null) {
  let contract;
  try {
    contract = require(`../../build/contracts/${contractName}.json`);
  } catch (error) {
    if (currentNetwork.name === 'Ganache') {
      console.error(`Can't find contract '${contractName}' in build/contracts. Please run 'yarn start' from project root.`);
    }
    return '';
  }

  const {
    networks,
  } = contract || {};
  let address = '';
  if (networks) {
    const lastNetworkId = Object.keys(networks).pop();
    address = contract.networks[lastNetworkId].address;
  }

  return address;
}
