import React, { useState, useEffect, ReactElement } from 'react';
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

export default function WithdrawDialog({
  aztec,
  zkAssets,
  userAddress,
}: {
  aztec: any;
  zkAssets: any;
  userAddress: Address;
}): ReactElement {
  const [open, setOpen] = React.useState(false);
  const [zkAsset, setZkAsset] = useState({} as any);
  const [publicBalance, setPublicBalance] = useState(0);
  const [privateBalance, setPrivateBalance] = useState(0);
  const [amount, setAmount] = useState('0');

  const handleClickOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  async function withdrawZkToken(withdrawAmount: string): Promise<void> {
    if (zkAsset) await zkAsset.withdraw(parseInt(withdrawAmount, 10));
    handleClose();
  }

  const updateZkAsset = async (address: Address): Promise<void> => {
    const newZkAsset = await aztec.zkAsset(address);
    setZkAsset(newZkAsset);

    const newPrivateBalance = await newZkAsset.balance(userAddress);
    setPrivateBalance(newPrivateBalance);
    const newPublicBalance = await newZkAsset.balanceOfLinkedToken(userAddress);
    setPublicBalance(newPublicBalance.toString(10));
  };

  useEffect(() => {
    if (aztec.zkAsset && Object.keys(zkAssets).length) {
      updateZkAsset(Object.keys(zkAssets)[0]);
    }
  }, [aztec.zkAsset, zkAssets]);

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        3. Withdraw back to ERC20 tokens
      </Button>
      <Dialog open={open} onClose={handleClose} scroll="body">
        <DialogTitle id="form-dialog-title">Withdraw tokens</DialogTitle>
        <DialogContent>
          <DialogContentText>Once done, you can convert your ZkAssets back into ERC20 tokens.</DialogContentText>
          <DialogContentText>
            {`Your public balance: ${publicBalance} ${zkAsset.address && zkAssets[zkAsset.address].symbol.slice(2)}`}
          </DialogContentText>
          <DialogContentText>
            {`Your private balance: ${privateBalance} ${zkAsset.address && zkAssets[zkAsset.address].symbol}`}
          </DialogContentText>
          <Grid container direction="row" spacing={3}>
            <Grid item xs={12}>
              <ZkAssetSelect currentAsset={zkAsset} updateAsset={updateZkAsset} assetList={zkAssets} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Enter withdraw amount"
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
          <Button onClick={(): Promise<void> => withdrawZkToken(amount)} color="primary">
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
