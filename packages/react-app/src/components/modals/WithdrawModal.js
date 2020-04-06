import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';

export default function WithdrawDialog({ aztec, zkAssets, userAddress }) {
  const [open, setOpen] = React.useState(false);
  const [zkAsset, setZkAsset] = useState();
  const [publicBalance, setPublicBalance] = useState(0);
  const [privateBalance, setPrivateBalance] = useState(0);
  const [amount, setAmount] = useState(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  async function withdrawZkToken(withdrawAmount) {
    await zkAsset.withdraw(parseInt(withdrawAmount, 10));
    handleClose();
  }

  const updateZkAsset = async (address) => {
    const zkAsset = await aztec.zkAsset(address);
    setZkAsset(zkAsset);

    const newPrivateBalance = await zkAsset.balance(userAddress);
    setPrivateBalance(newPrivateBalance);
    const newPublicBalance = await zkAsset.balanceOfLinkedToken(userAddress);
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
            {`Your public balance: ${publicBalance} ${zkAsset && zkAssets[zkAsset.address].symbol.slice(2)}`}
          </DialogContentText>
          <DialogContentText>
            {`Your private balance: ${privateBalance} ${zkAsset && zkAssets[zkAsset.address].symbol}`}
          </DialogContentText>
          <Grid container direction="row" spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                label="zkAsset"
                value={zkAsset ? zkAsset.address : undefined}
                onChange={(val) => updateZkAsset(val.target.value)}
                SelectProps={{
                  native: true,
                }}
                variant="filled"
                fullWidth
                // className={classes.formControl}
              >
                {Object.entries(zkAssets).map(([address, metadata]) => (
                  <option key={address} value={address}>
                    {metadata.symbol}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Enter withdraw amount"
                placeholder=""
                variant="outlined"
                value={amount}
                onChange={(val) => setAmount(val.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => withdrawZkToken(amount)} color="primary">
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
