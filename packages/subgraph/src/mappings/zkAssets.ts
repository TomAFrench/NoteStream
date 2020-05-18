import { ZkAsset } from '../types/schema';

export function addZkAsset(address: string): void {
  let zkAsset = ZkAsset.load(address);
  if (zkAsset != null) {
    return;
  }

  /* Mainnet */
  zkAsset = new ZkAsset(address);

  /* Testnets */
  if (address == '0x9a5df4e3c6de1f39fe09cbe6c1f27a4c3ab52d7c') {
    zkAsset.name = 'zkTestnetDAI';
    zkAsset.scalingFactor = 1;
    zkAsset.symbol = 'zkDAI';
  } else if (address == '0xfd3cebb289b26ad63a389365187689fe21f204cd') {
    zkAsset.name = 'zkZEENUS';
    zkAsset.scalingFactor = 1;
    zkAsset.symbol = 'zkZEENUS';
  } else {
    zkAsset.name = 'unknown';
    zkAsset.scalingFactor = 1;
    zkAsset.symbol = 'unknown';
  }

  zkAsset.save();
}
