import React, { ReactElement } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Paper, Grid, Typography, CircularProgress } from '@material-ui/core';

import { Contract } from '@ethersproject/contracts';
import StreamTable from '../components/StreamTable';

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

const HomePage = ({
  streamContract,
}: {
  streamContract?: Contract;
}): ReactElement => {
  const classes = useStyles();

  if (!streamContract) {
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
    <Grid container direction="column" spacing={3}>
      <Grid item>
        <Paper className={classes.paper}>
          <Typography variant="h4">Incoming streams</Typography>
          <StreamTable role="recipient" streamContract={streamContract} />
        </Paper>
      </Grid>
      <Grid item>
        <Paper className={classes.paper}>
          <Typography variant="h4">Outgoing streams</Typography>
          <StreamTable role="sender" streamContract={streamContract} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HomePage;
