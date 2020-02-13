export default function getContractAddress(contractName, networkId = null) {
  let contract;
  try {
    contract = require(`../../build/contracts/${contractName}.json`);
  } catch (error) {
    console.error(`Cannot find contract '${contractName}' in build/contracts.`);
    return '';
  }

  const {
    networks,
  } = contract || {};
  let address = (networks && networks[networkId]) || '';
  if (networkId === null && networks) {
    const lastNetworkId = Object.keys(contract.networks).pop();
    address = contract.networks[lastNetworkId].address;
  }
  if (!address) {
    console.error(`Cannot find address of contract '${contractName}' with network id ${networkId}.`);
    return '';
  }

  return address;
}
