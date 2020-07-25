import { useState, useEffect } from 'react';
import { Address } from '../types/types';
import { useWalletProvider } from '../contexts/OnboardContext';
import lookupAddress from '../utils/ens/lookupAddress';

const useENSName = (address: Address): string => {
  const provider = useWalletProvider();
  const [ensName, setEnsName] = useState<string>(address);

  useEffect(() => {
    if (provider) {
      lookupAddress(provider, address).then((name: string) => setEnsName(name));
    }
  }, [provider, address]);

  return ensName;
};

export default useENSName;
