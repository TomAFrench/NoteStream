import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

import getZkAssetsForNetwork from "zkasset-metadata"

const zkAssets = getZkAssetsForNetwork(4)

const Deposit = ({
  userAddress, zkAsset, zkdaiBalance, daiBalance,
}) => {
  const [amount, setAmount] = useState(null);

  async function depositZkToken(depositAmount) {
    await zkAsset.deposit([
      { to: userAddress, amount: parseInt(depositAmount, 10) },
    ]);
    setAmount(0);
  }

  async function withdrawZkToken(withdrawAmount) {
    await zkAsset.withdraw(parseInt(withdrawAmount, 10));
    setAmount(0);
  }

  return (
    <Grid
      container
      direction="column"
      spacing={3}
    >
      {zkAsset ?
      <>
        <Grid item>
          {`Your public balance: ${daiBalance} ${zkAssets[zkAsset.address].symbol.slice(2)}`}
        </Grid>
        <Grid item>
          {`Your private balance: ${zkdaiBalance} ${zkAssets[zkAsset.address].symbol}`}
        </Grid>
        <Grid item>
          <TextField
          label="Enter deposit/withdraw amount"
          placeholder=""
          variant="outlined"
          value={amount}
          onChange={val => setAmount(val.target.value)}
          fullWidth
        />
        </Grid>
        <Grid item container direction="row" justify="space-around">
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => depositZkToken(amount)}
            >
              Deposit
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => withdrawZkToken(amount)}
            >
              Withdraw
            </Button>
          </Grid>
        </Grid>
      </>
      :
      <Grid item container direction="row" justify="center">
        <CircularProgress />
      </Grid>
      }
    </Grid>
  );
};

Deposit.propTypes = {
  userAddress: PropTypes.string.isRequired,
  zkAsset: PropTypes.object.isRequired,
  zkdaiBalance: PropTypes.number,
  daiBalance: PropTypes.string,
};

export default Deposit;
