import { BigNumberish, BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

export const convertToTokenValue = (
  value: BigNumberish,
  scalingFactor: BigNumberish,
): BigNumber => BigNumber.from(value).mul(scalingFactor);

export const convertToTokenValueDisplay = (
  value: BigNumberish,
  scalingFactor: BigNumberish,
  decimals: number,
): string => formatUnits(convertToTokenValue(value, scalingFactor), decimals);
