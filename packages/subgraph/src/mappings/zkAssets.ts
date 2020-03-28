import { ZkAsset } from "../types/schema";

export function addZkAsset(address: string): void {
  let zkAsset = ZkAsset.load(address);
  if (zkAsset != null) {
    return;
  }

  /* Mainnet */
  zkAsset = new ZkAsset(address);

  /* Testnets */
  // if (
  //   address == "0x8B138ABB8061bcca91a4d60f966cad78aEc9cA7D" /* Rinkeby */
  // ) {
  zkAsset.name = "zkTestnetDAI";
  zkAsset.scalingFactor = 1;
  zkAsset.symbol = "zkTESTDAI";
  // }

  zkAsset.save();
}
