import { getContractAddressesForNetwork } from '@notestream/contract-artifacts';

export default async function setupAztec(network: number): Promise<void> {
  const addresses = getContractAddressesForNetwork(network);
  const account = await window.aztec.enable({
    contractAddresses: {
      ACE: addresses.ACE,
    },
    apiKey: '9HRKN7S-JSZMRJM-KWSDWSY-B2VSRD9', // API key for use with GSN for free txs.
  });
  if (account) {
    console.log('Initialised AZTEC:', window.aztec);
  }
}
