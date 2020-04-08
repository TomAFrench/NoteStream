/* eslint-disable @typescript-eslint/no-misused-promises */
import Web3 from 'web3';

const getWeb3 = (): Promise<Web3> =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const { web3 } = window;
        resolve(web3);
      } else {
        reject();
      }
    });
  });

export default getWeb3;
