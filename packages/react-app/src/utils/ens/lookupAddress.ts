import { Web3Provider } from 'ethers/providers';
import { getAddress } from 'ethers/utils';

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
