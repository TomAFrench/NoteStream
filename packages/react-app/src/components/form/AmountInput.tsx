import React, { ReactElement } from 'react';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

const AmountInput = (props: any): ReactElement => {
  const {
    amount,
    setAmount,
    balance,
    symbol,
  }: {
    amount: string;
    setAmount: Function;
    balance: string;
    symbol: string;
  } = props;

  return (
    <TextField
      {...props}
      value={amount}
      onChange={(val): void => {
        setAmount(val.target.value);
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">{`Balance: ${balance} ${symbol}`}</InputAdornment>
        ),
      }}
    />
  );
};

export default AmountInput;
