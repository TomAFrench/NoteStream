import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';

import moment from 'moment';

const daysOption = [...Array(366).keys()];
const hoursOption = [...Array(24).keys()];
const minutesOption = [...Array(60).keys()];

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },  
}));


const Create = ({
  userAddress,
  zkAsset,
  streamContractInstance,
  zkdaiBalance,
}) => {
  const classes = useStyles()
  const [streamAmount, setStreamAmount] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  function initialiseStream(
    payeeAddress,
    noteForStreamContract,
    startTime,
    endTime,
  ) {
    console.log('methods', streamContractInstance.methods);
    return streamContractInstance.methods
      .createStream(
        payeeAddress,
        noteForStreamContract.noteHash,
        zkAsset.address,
        startTime,
        endTime,
      )
      .send({ from: userAddress }, (err, streamID) => {
        if (err) {
          console.log(err);
          return null;
        }
        console.log('Steam ID', streamID);
        return streamID;
      });
  }

  async function fundStream(
    streamContractAddress,
    payeeAddress,
    sendAmount,
    asset,
  ) {
    const sendResp = await asset.send(
      [
        {
          to: streamContractAddress,
          amount: sendAmount,
          aztecAccountNotRequired: true,
          numberOfOutputNotes: 1, // contract has one
        },
      ],
      { userAccess: [userAddress, payeeAddress] }, // Give view access to sender and recipient
    );
    console.info('sent funds confidentially');
    console.log('_sendResp', sendResp);
    let noteForStreamContract = null;
    sendResp.outputNotes.forEach((outputNote) => {
      if (outputNote.owner === streamContractAddress) {
        noteForStreamContract = outputNote;
      }
    });
    console.log('noteForStreamContract', noteForStreamContract);
    return noteForStreamContract;
  }

  async function createStream(sendAmount, payeeAddress, startTime, endTime) {
    const streamNote = await fundStream(
      streamContractInstance.options.address,
      payeeAddress,
      sendAmount,
      zkAsset,
    );
    return initialiseStream(
      payeeAddress,
      streamNote,
      startTime,
      endTime,
    );
  }

  return (
      <Grid
      container
      direction="column"
      alignContent="stretch"
      alignItems="stretch"
      spacing={3}
    >
      <Grid item xs={12} >
        <Typography>
          Your zkDai Balance: {zkdaiBalance} ZkDai
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
        label="Recipient"
        placeholder="0x...."
        variant="outlined"
        value={recipient}
        onChange={val => setRecipient(val.target.value)}
        fullWidth
        flexGrow={1}
      />
      </Grid>
      <Grid item xs={12}>
        <TextField
        label="Enter deposit/withdraw amount"
        placeholder=""
        variant="outlined"
        value={streamAmount}
        onChange={val => setStreamAmount(val.target.value)}
        fullWidth
        flexGrow={1}
      />
      </Grid>
      <Grid item>
        <Typography>
          For how long do you want to stream?
        </Typography>
      </Grid>
      <Grid item container
        direction="row"
        justify="center"
        alignContent="stretch"
        spacing={2}
        xs={12}>
        <Grid item>
          <TextField
            select
            label="Days"
            value={days}
            onChange={val => setDays(val.target.value)}
            SelectProps={{
              native: true,
            }}
            variant="filled"
            fullWidth
            className={classes.formControl}
          >
            {daysOption.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
            ))}
          </TextField>
        </Grid>
        <Grid item>
          <TextField
            select
            label="Hours"
            value={hours}
            onChange={val => setHours(val.target.value)}
            SelectProps={{
              native: true,
            }}
            variant="filled"
            fullWidth
            className={classes.formControl}
          >
            {hoursOption.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
            ))}
          </TextField>
        </Grid>
        <Grid item>
          <TextField
            select
            label="Minutes"
            value={minutes}
            onChange={val => setMinutes(val.target.value)}
            SelectProps={{
              native: true,
            }}
            variant="filled"
            fullWidth
            className={classes.formControl}
          >
            {minutesOption.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          onClick={() => createStream(
            streamAmount,
            recipient,
            parseInt(
              moment()
                .add(5, 'minutes')
                .format('X'),
              10,
            ),
            parseInt(
              moment()
                .add(days, 'days')
                .add(hours, 'hours')
                .add(minutes + 5, 'minutes')
                .format('X'),
              10,
            ),
          )}
          >
        Create stream
        </Button>
      </Grid>
    </Grid>
  );
};

Create.propTypes = {
  streamContractInstance: PropTypes.object.isRequired,
  userAddress: PropTypes.string.isRequired,
  zkAsset: PropTypes.object.isRequired,
  zkdaiBalance: PropTypes.number,
  daiBalance: PropTypes.number,
};

export default Create;
