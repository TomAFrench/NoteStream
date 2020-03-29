import { ZkAsset } from "../types/schema";


export function addZkAsset(address: string): void {
  let zkAsset = ZkAsset.load(address);
  if (zkAsset != null) {
    return;
  }

  /* Mainnet */
  zkAsset = new ZkAsset(address);

  /* Testnets */
  if (address == "0x9a5DF4E3C6de1f39fE09cbE6C1F27a4c3AB52d7c") {
    zkAsset.name = "zkTestnetDAI";
    zkAsset.scalingFactor = 1;
    zkAsset.symbol = "zkDAI";
  } else if (address == "0xfD3CEbb289B26ad63a389365187689fe21f204Cd") {
    zkAsset.name = "zkZEENUS";
    zkAsset.scalingFactor = 1;
    zkAsset.symbol = "zkZEENUS";
  }

  zkAsset.save();
}
