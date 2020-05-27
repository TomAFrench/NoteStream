import React, { ReactElement, useCallback, useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Paper,
  Grid,
  Typography,
  TextField,
  IconButton,
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ZkAssetSelect from '../components/form/ZkAssetSelect';

import Link from '../components/Link';
import { useAztec, useZkAssets } from '../contexts/AztecContext';
import { useAddress } from '../contexts/OnboardContext';
import { Address } from '../types/types';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    [theme.breakpoints.up(800 + theme.spacing(3) * 2)]: {
      padding: theme.spacing(3),
    },
  },
  pageElement: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    [theme.breakpoints.up(800 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
  },
  icon: {
    marginRight: theme.spacing(2),
  },
}));

const ExchangePage = (): ReactElement => {
  const classes = useStyles();
  const userAddress = useAddress();
  const aztec = useAztec();
  const zkAssets = useZkAssets();

  const [zkAsset, setZkAsset] = useState<any>({} as any);
  const [publicBalance, setPublicBalance] = useState<number>(0);
  const [privateBalance, setPrivateBalance] = useState<number>(0);
  const [deposit, setDeposit] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>('');

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

  async function depositZkToken(depositAmount: string): Promise<void> {
    console.log(zkAsset);
    await zkAsset.deposit([
      { to: userAddress, amount: parseInt(depositAmount, 10) },
    ]);
  }

  async function withdrawZkToken(withdrawAmount: string): Promise<void> {
    if (zkAsset) await zkAsset.withdraw(parseInt(withdrawAmount, 10));
  }

  return (
    <>
      <Paper className={`${classes.pageElement} ${classes.paper}`}>
        <Grid container direction="row" spacing={3}>
          <Grid item>
            <Typography variant="h4">Convert Assets</Typography>
            <Typography>
              To use NoteStream, you need to exchange your ERC20 tokens for
              ZkAssets which can interact with AZTEC Protocol
            </Typography>
            <Typography>
              You can mint some{' '}
              <Link
                target="_blank"
                rel="noopener noreferrer"
                to="https://rinkeby.etherscan.io/address/0xc3dbf84abb494ce5199d5d4d815b10ec29529ff8"
              >
                DAI
              </Link>{' '}
              or{' '}
              <Link
                target="_blank"
                rel="noopener noreferrer"
                to="https://rinkeby.etherscan.io/address/0x1f9061B953bBa0E36BF50F21876132DcF276fC6e"
              >
                ZEENUS
              </Link>{' '}
              in order to test NoteStream using Etherscan.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <Paper className={`${classes.pageElement} ${classes.paper}`}>
        <Grid container justify="center" spacing={3}>
          <Grid item>
            {`Your public balance: ${publicBalance} ${
              zkAsset.address && zkAssets[zkAsset.address].symbol.slice(2)
            }`}
          </Grid>
          <Grid item>
            {`Your private balance: ${privateBalance} ${
              zkAsset.address && zkAssets[zkAsset.address].symbol
            }`}
          </Grid>
          <Grid item container justify="center" spacing={1}>
            <Grid item>
              <TextField
                label="Enter deposit amount"
                placeholder=""
                variant="outlined"
                value={amount}
                onChange={(val): void => setAmount(val.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item>
              <Typography>
                {zkAssets[zkAsset.address] &&
                  zkAssets[zkAsset.address].symbol.slice(2)}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton onClick={(): void => setDeposit(!deposit)}>
                {deposit ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Grid>
            <Grid item>
              <TextField
                label="Enter deposit amount"
                placeholder=""
                variant="outlined"
                value={amount}
                onChange={(val): void => setAmount(val.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item>
              <ZkAssetSelect
                currentAsset={zkAsset}
                updateAsset={updateZkAsset}
                assetList={zkAssets}
              />
            </Grid>
          </Grid>
          <Grid item>
            <Button
              onClick={(): Promise<void> =>
                deposit ? depositZkToken(amount) : withdrawZkToken(amount)
              }
              color="primary"
              variant="contained"
            >
              {deposit ? 'Deposit' : 'Withdraw'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default ExchangePage;
