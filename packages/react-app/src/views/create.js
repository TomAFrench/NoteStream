import React, { useState } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'

import moment from "moment";

const daysOption = [...Array(366).keys()];
const hoursOption = [...Array(24).keys()];
const minutesOption = [...Array(60).keys()];

const Create = ({
  userAddress,
  zkAsset,
  streamContractInstance,
  zkdaiBalance
}) => {
  const [streamAmount, setStreamAmount] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  function initialiseStream(
    payeeAddress,
    noteForStreamContract,
    startTime,
    endTime
  ) {
    console.log("methods", streamContractInstance.methods);
    return streamContractInstance.methods
      .createStream(
        payeeAddress,
        noteForStreamContract.noteHash,
        zkAsset.address,
        startTime,
        endTime
      )
      .send({from: userAddress}, (err, streamID) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Steam ID", streamID);
          return streamID;
        }
      });
  }

  async function fundStream(
    streamContractAddress,
    payeeAddress,
    sendAmount,
    asset
  ) {
    const _sendResp = await asset.send(
      [
        {
          to: streamContractAddress,
          amount: sendAmount,
          aztecAccountNotRequired: true,
          numberOfOutputNotes: 1 // contract has one
        }
      ],
      { userAccess: [userAddress, payeeAddress] } // Give view access to sender and recipient
    );
    console.info("sent funds confidentially");
    console.log("_sendResp", _sendResp);
    let noteForStreamContract = null;
    _sendResp.outputNotes.forEach(function(outputNote) {
      if (outputNote.owner === streamContractAddress) {
        noteForStreamContract = outputNote;
      }
    });
    console.log("noteForStreamContract", noteForStreamContract);
    return noteForStreamContract;
  }

  async function createStream(sendAmount, payeeAddress, startTime, endTime) {
    const streamNote = await fundStream(
      streamContractInstance.options.address,
      payeeAddress,
      sendAmount,
      zkAsset
    );
    return initialiseStream(
      payeeAddress,
      streamNote,
      startTime,
      endTime
    );
  }

  return (
      <Grid
      container
      direction="column"
      spacing={3}
    >
      <Grid item>
      <p style={{ marginBottom: 20 }}>
        Your zkDai Balance: {zkdaiBalance} ZkDai
      </p>
      </Grid>
      <Grid item>
        <TextField
        label="Recipient"
        placeholder="0x...."
        variant="outlined"
        value={recipient}
        onChange={val => setRecipient(val.target.value)}
        fullWidth
      />
      </Grid>
      <Grid item>
        <TextField
        label="Enter deposit/withdraw amount"
        placeholder=""
        variant="outlined"
        value={streamAmount}
        onChange={val => setStreamAmount(val.target.value)}
        fullWidth
      />
      </Grid>
      <Grid item>
        <p style={{ marginBottom: 10 }}>For how long do you want to stream?</p>
      </Grid>
      <Grid item container direction="row" justify="center">
        <Grid item>
          <TextField
            select
            label="Days"
            value={days}
            onChange={(val) => setDays(val.target.value)}
            SelectProps={{
              native: true,
            }}
            variant="filled"
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
            onChange={(val) => setHours(val.target.value)}
            SelectProps={{
              native: true,
            }}
            variant="filled"
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
            onChange={(val) => setMinutes(val.target.value)}
            SelectProps={{
              native: true,
            }}
            variant="filled"
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
          onClick={() =>
            createStream(
              streamAmount,
              recipient,
              parseInt(moment().add(5, "minutes").format("X")),
              parseInt(moment().add(days, "days").add(hours, "hours").add(minutes + 5, "minutes").format("X"))
            )}
          >
        Create stream
        </Button>
      </Grid>
    </Grid>
  );
};

export default Create;
