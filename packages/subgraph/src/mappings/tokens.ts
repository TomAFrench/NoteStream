import { Token } from '../types/schema';

export function addToken(address: string, zkAsset: string): void {
  let token = Token.load(address);
  if (token != null) {
    return;
  }

  /* Mainnet */
  token = new Token(address);
  token.zkAsset = zkAsset;
  /* Testnets */
  if (address == '0xc3dbf84abb494ce5199d5d4d815b10ec29529ff8') {
    token.name = 'TestnetDAI';
    token.decimals = 18;
    token.symbol = 'DAI';
  } else if (address == '0x1f9061b953bba0e36bf50f21876132dcf276fc6e') {
    token.name = 'ZEENUS';
    token.decimals = 0;
    token.symbol = 'ZEENUS';
  } else if (address == '0x022e292b44b5a146f2e8ee36ff44d3dd863c915c') {
    token.name = 'XEENUS';
    token.decimals = 18;
    token.symbol = 'XEENUS';
  } else {
    token.name = 'unknown';
    token.decimals = 0;
    token.symbol = 'unknown';
  }

  token.save();
}
