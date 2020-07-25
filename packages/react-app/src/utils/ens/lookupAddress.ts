import { Web3Provider } from '@ethersproject/providers';
import { getAddress } from '@ethersproject/address';

const lookupAddress = async (
  provider: Web3Provider,
  address: string,
): Promise<string> => {
  try {
    const reportedName = await provider.lookupAddress(address);
    const resolvedAddress = await provider.resolveName(reportedName);
    if (getAddress(address) === getAddress(resolvedAddress)) {
      return reportedName;
    }
  } catch (e) {
    // Do nothing
  }
  return '';
};

export default lookupAddress;
