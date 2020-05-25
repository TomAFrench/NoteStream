import React, { ReactElement } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import DepositDialog from '../components/modals/DepositModal';
import WithdrawDialog from '../components/modals/WithdrawModal';

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

  return (
    <Paper className={`${classes.pageElement} ${classes.paper}`}>
      <Grid container direction="row" justify="space-around" spacing={3}>
        <Grid item>
          <DepositDialog />
        </Grid>
        <Grid item>
          <WithdrawDialog />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ExchangePage;
