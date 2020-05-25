import React, { ReactElement } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Contract } from 'ethers';
import CreateStreamDialog from '../components/modals/CreateStreamModal';

import Status from '../components/Status';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    padding: theme.spacing(2),
    [theme.breakpoints.up(800 + theme.spacing(3) * 2)]: {
      padding: theme.spacing(3),
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
  },
}));

const SendPage = ({
  streamContractInstance,
}: {
  streamContractInstance?: Contract;
}): ReactElement => {
  const classes = useStyles();

  if (!streamContractInstance) {
    return (
      <Paper className={classes.paper}>
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={3}
        >
          <CircularProgress />
        </Grid>
      </Paper>
    );
  }

  return (
    <>
      <Paper className={classes.paper}>
        <Grid container direction="row" justify="space-around" spacing={3}>
          <Grid item>
            <CreateStreamDialog
              streamContractInstance={streamContractInstance}
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper className={classes.paper}>
        <Status role="sender" streamContractInstance={streamContractInstance} />
      </Paper>
    </>
  );
};

export default SendPage;
