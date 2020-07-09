import { useEffect, useState } from 'react';
import { Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';

import { Token, Address } from '../types/types';
import ERC20 from '../abis/ERC20Detailed';

const useTokenDetails = (
  provider?: Provider,
  tokenAddress?: Address,
): Token => {
  const [tokenDetails, setTokenDetails] = useState<Token>({
    name: '',
    symbol: '',
    decimals: 18,
  });

  useEffect(() => {
    if (!provider || !tokenAddress) return;

    const tokenContract = new Contract(tokenAddress, ERC20.abi, provider);

    const updateToken = async (): Promise<void> => {
      const tokenName = tokenContract.name();
      const tokenSymbol = tokenContract.symbol();
      const tokenDecimals = tokenContract.decimals();
      setTokenDetails({
        name: await tokenName,
        symbol: await tokenSymbol,
        decimals: await tokenDecimals,
      });
    };

    updateToken();
  }, [provider, tokenAddress]);

  return tokenDetails;
};

export default useTokenDetails;
