import { getContractAddressesForNetwork } from '@notestream/contract-artifacts';

export async function setupOnboard(onboard: any, defaultWallet: string): Promise<void> {
  try {
    const selected = await onboard.walletSelect(defaultWallet);
    if (selected) {
      const ready = await onboard.walletCheck();
      if (ready) {
        const walletState = onboard.getState();
        console.log(walletState);
      } else {
        // Connection to wallet failed
      }
    } else {
      // User aborted set up
    }
  } catch (error) {
    console.log('error onboarding', error);
  }
}

export async function setupAztec(network: number): Promise<void> {
  const addresses = getContractAddressesForNetwork(network);
  const account = await window.aztec.enable({
    contractAddresses: {
      ACE: addresses.ACE,
    },
    apiKey: '9HRKN7S-JSZMRJM-KWSDWSY-B2VSRD9', // API key for use with GSN for free txs.
  });
  if (account) {
    console.log('Initialised AZTEC');
  }
}
