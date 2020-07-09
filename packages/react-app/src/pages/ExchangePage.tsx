import React, { ReactElement, useCallback, useEffect, useState } from 'react';

import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';

import { makeStyles } from '@material-ui/core/styles';
import { Button, Paper, Grid, Typography, IconButton } from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AmountInput from '../components/form/AmountInput';
import ZkAssetSelect from '../components/form/ZkAssetSelect';

import Link from '../components/Link';
import { useAztec, useZkAssets } from '../contexts/AztecContext';
import { useAddress, useWalletProvider } from '../contexts/OnboardContext';

import { Address, ZkAsset } from '../types/types';

import ERC20 from '../abis/ERC20Detailed';

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
  const provider = useWalletProvider();

  const [zkAsset, setZkAsset] = useState<ZkAsset | undefined>();
  const [publicBalance, setPublicBalance] = useState<number>(0);
  const [privateBalance, setPrivateBalance] = useState<number>(0);
  const [deposit, setDeposit] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>('');

  const updateZkAsset = useCallback(
    async (address: Address): Promise<void> => {
      const newZkAsset: ZkAsset = await aztec.zkAsset(address);
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

  useEffect(() => {
    const updateToken = async (): Promise<void> => {
      if (provider && zkAsset?.linkedTokenAddress) {
        const linkedToken = new Contract(
          zkAsset.linkedTokenAddress,
          ERC20.abi,
          new Web3Provider(provider),
        );
        const tokenSymbol = linkedToken.symbol();
        const tokenDecimals = linkedToken.decimals();
        zkAsset.token.symbol = await tokenSymbol;
        zkAsset.token.decimals = await tokenDecimals;
      }
    };
    updateToken();
  }, [provider, zkAsset]);

  function depositZkToken(depositAmount: BigNumber): void {
    if (zkAsset) {
      zkAsset.deposit([{ to: userAddress, amount: depositAmount.toString() }]);
    }
  }

  function withdrawZkToken(withdrawAmount: string): void {
    if (zkAsset) zkAsset.withdraw(parseInt(withdrawAmount, 10));
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
        <Grid container alignItems="center" justify="center" spacing={3}>
          <Grid item>
            <Typography variant="body1">ZkAsset to convert:</Typography>
          </Grid>
          <Grid item>
            <ZkAssetSelect
              currentAsset={zkAsset}
              updateAsset={updateZkAsset}
              assetList={zkAssets}
            />
          </Grid>
          <Grid item container justify="center" spacing={2}>
            <Grid item xs={3}>
              <AmountInput
                label="Public"
                placeholder=""
                variant="outlined"
                amount={amount}
                setAmount={setAmount}
                balance={
                  zkAsset?.token
                    ? formatUnits(publicBalance, zkAsset.token.decimals)
                    : publicBalance
                }
                symbol={zkAsset?.token?.symbol}
                fullWidth
              />
            </Grid>
            <Grid item>
              <IconButton onClick={(): void => setDeposit(!deposit)}>
                {deposit ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Grid>
            <Grid item xs={3}>
              <AmountInput
                label="Private"
                placeholder=""
                variant="outlined"
                amount={amount}
                setAmount={setAmount}
                balance={
                  zkAsset?.toTokenValue(privateBalance) || privateBalance
                }
                symbol={
                  zkAsset?.address &&
                  zkAssets[zkAsset?.address] &&
                  zkAssets[zkAsset?.address].symbol
                }
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid item>
            <Button
              onClick={(): void =>
                deposit
                  ? depositZkToken(
                      parseUnits(amount, zkAsset?.token.decimals).div(
                        zkAsset?.scalingFactor || 1,
                      ),
                    )
                  : withdrawZkToken(amount)
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
