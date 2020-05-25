import TransakSDK from '@transak/transak-sdk';

import { Address } from '../types/types';

const setupTransak = (userAddress: Address, themeColor: string): any => {
  console.log(process.env.REACT_APP_TRANSAK_API_KEY);
  return new TransakSDK({
    apiKey: process.env.REACT_APP_TRANSAK_API_KEY,
    environment: 'STAGING',
    exchangeScreenTitle: 'Purchase crypto instantly',
    defaultCryptoCurrency: 'ETH',
    cryptoCurrencyList: 'ETH,DAI',
    walletAddress: userAddress,
    themeColor,
    // fiatCurrency: 'GBP',
    // fiatAmount: 100,
    email: '',
    redirectURL: '',
    hostURL: window.location.origin,
    widgetHeight: '600px',
    widgetWidth: '450px',
  });
};

export default setupTransak;
