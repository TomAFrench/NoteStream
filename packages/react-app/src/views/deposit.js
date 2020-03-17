import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import '../App.css';

const Deposit = ({
  userAddress, zkAsset, zkdaiBalance, daiBalance,
}) => {
  const [amount, setAmount] = useState(null);

  useEffect(() => {
    if (zkAsset) {
      // getBalance(zkAsset);
    }
  });

  async function depositZkToken(depositAmount) {
    console.log('deposit', depositAmount);
    await zkAsset.deposit([
      { to: userAddress, amount: parseInt(depositAmount, 10) },
    ]);
    // getBalance(zkAsset);
    setAmount(0);
  }

  async function withdrawZkToken(withdrawAmount) {
    console.log('withdraw', withdrawAmount);
    await zkAsset.withdraw(parseInt(withdrawAmount, 10));
    // getBalance(zkAsset);
    setAmount(0);
  }

  return (
    <Grid
      container
      direction="column"
      spacing={3}
    >
      <Grid item>
        Your Dai Balance: {daiBalance} Dai
      </Grid>
      <Grid item>
        Your zkDai Balance: {zkdaiBalance} ZkDai
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
            onClick={() => depositZkToken(parseInt(amount, 10))}
          >
            Deposit
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => withdrawZkToken(parseInt(amount, 10))}
          >
            Withdraw
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

Deposit.propTypes = {
  userAddress: PropTypes.string.isRequired,
  zkAsset: PropTypes.object.isRequired,
  zkdaiBalance: PropTypes.number,
  daiBalance: PropTypes.number,
};

export default Deposit;
