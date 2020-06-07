import {
  BigNumberish,
  formatUnits,
  bigNumberify,
  BigNumber,
} from 'ethers/utils';

export const convertToTokenValue = (
  value: BigNumberish,
  scalingFactor: BigNumberish,
): BigNumber => {
  return bigNumberify(value).mul(scalingFactor);
};

export const convertToTokenValueDisplay = (
  value: BigNumberish,
  scalingFactor: BigNumberish,
  decimals: number,
): string => {
  return formatUnits(convertToTokenValue(value, scalingFactor), decimals);
};
