import { json } from '@graphprotocol/graph-ts';
import { ZkAsset } from '../types/schema';
import { addToken } from './tokens';

export function addZkAsset(address: string): void {
  let zkAsset = ZkAsset.load(address);
  if (zkAsset != null) {
    return;
  }

  /* Mainnet */
  zkAsset = new ZkAsset(address);

  /* Testnets */
  if (address == '0x9a9c00d7015f2708f30875e2d81f206bb5052e31') {
    zkAsset.name = 'zkTestnetDAI';
    zkAsset.scalingFactor = json.toBigInt('10000000000000000');
    zkAsset.symbol = 'zkDAI';
    zkAsset.linkedToken = '0xc3dbf84abb494ce5199d5d4d815b10ec29529ff8';
    addToken(zkAsset.linkedToken, '0x9a9c00d7015f2708f30875e2d81f206bb5052e31');
  } else if (address == '0xfd3cebb289b26ad63a389365187689fe21f204cd') {
    zkAsset.name = 'zkZEENUS';
    zkAsset.scalingFactor = json.toBigInt('1');
    zkAsset.symbol = 'zkZEENUS';
    zkAsset.linkedToken = '0x1f9061b953bba0e36bf50f21876132dcf276fc6e';
    addToken(zkAsset.linkedToken, '0xfd3cebb289b26ad63a389365187689fe21f204cd');
  } else if (address == '0x232d758910c5249f1ccc3cb774001da1a685de3f') {
    zkAsset.name = 'zkXEENUS';
    zkAsset.scalingFactor = json.toBigInt('50000000000000000');
    zkAsset.symbol = 'zkXEENUS';
    zkAsset.linkedToken = '0x022e292b44b5a146f2e8ee36ff44d3dd863c915c';
    addToken(zkAsset.linkedToken, '0x232d758910c5249f1ccc3cb774001da1a685de3f');
  } else {
    zkAsset.name = 'unknown';
    zkAsset.scalingFactor = json.toBigInt('10000000000000000');
    zkAsset.symbol = 'unknown';
  }

  zkAsset.save();
}
