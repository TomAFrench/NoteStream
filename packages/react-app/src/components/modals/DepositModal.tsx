import React, { ReactElement, useCallback, useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';

import ZkAssetSelect from '../form/ZkAssetSelect';

import { Address } from '../../types/types';
import { useAztec, useZkAssets } from '../../contexts/AztecContext';
import { useAddress } from '../../contexts/OnboardContext';

export default function DepositDialog(): ReactElement {
  const userAddress = useAddress();
  const aztec = useAztec();
  const zkAssets = useZkAssets();

  const [open, setOpen] = useState<boolean>(false);
  const [zkAsset, setZkAsset] = useState<any>({} as any);
  const [publicBalance, setPublicBalance] = useState<number>(0);
  const [privateBalance, setPrivateBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');

  const handleClickOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  async function depositZkToken(depositAmount: string): Promise<void> {
    console.log(zkAsset);
    await zkAsset.deposit([
      { to: userAddress, amount: parseInt(depositAmount, 10) },
    ]);
    handleClose();
  }

  const updateZkAsset = useCallback(
    async (address: Address): Promise<void> => {
      const newZkAsset = await aztec.zkAsset(address);
      setZkAsset(newZkAsset);

      const newPrivateBalance = await newZkAsset.balance(userAddress);
      setPrivateBalance(newPrivateBalance);
      const newPublicBalance = await newZkAsset.balanceOfLinkedToken(
        userAddress,
      );
      setPublicBalance(newPublicBalance.toString(10));
    },
    [aztec, userAddress],
  );

  useEffect(() => {
    if (aztec.zkAsset && Object.keys(zkAssets).length) {
      updateZkAsset(Object.keys(zkAssets)[0]);
    }
  }, [aztec.zkAsset, zkAssets, updateZkAsset]);

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        1. Deposit ERC20 tokens for private assets
      </Button>
      <Dialog open={open} onClose={handleClose} scroll="body">
        <DialogTitle id="form-dialog-title">Deposit tokens</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To use NoteStream, you need to exchange your ERC20 tokens for
            ZkAssets which can interact with AZTEC Protocol
          </DialogContentText>
          <DialogContentText>
            You can mint some{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://rinkeby.etherscan.io/address/0xc3dbf84abb494ce5199d5d4d815b10ec29529ff8"
            >
              DAI
            </a>{' '}
            or{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://rinkeby.etherscan.io/address/0x1f9061B953bBa0E36BF50F21876132DcF276fC6e"
            >
              ZEENUS
            </a>{' '}
            in order to test NoteStream using Etherscan.
          </DialogContentText>
          <DialogContentText>
            {`Your public balance: ${publicBalance} ${
              zkAsset.address && zkAssets[zkAsset.address].symbol.slice(2)
            }`}
          </DialogContentText>
          <DialogContentText>
            {`Your private balance: ${privateBalance} ${
              zkAsset.address && zkAssets[zkAsset.address].symbol
            }`}
          </DialogContentText>
          <Grid container direction="row" spacing={3}>
            <Grid item xs={12}>
              <ZkAssetSelect
                currentAsset={zkAsset}
                updateAsset={updateZkAsset}
                assetList={zkAssets}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Enter deposit amount"
                placeholder=""
                variant="outlined"
                value={amount}
                onChange={(val): void => setAmount(val.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={(): Promise<void> => depositZkToken(amount)}
            color="primary"
          >
            Deposit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
