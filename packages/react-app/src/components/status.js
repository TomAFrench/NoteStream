import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import moment from 'moment';
import LinearProgress from '@material-ui/core/LinearProgress';
import calculateTime from '../utils/time';

import { calculateMaxWithdrawalValue, withdrawFunds } from '../utils/withdrawal';
import { cancelStream } from '../utils/cancellation';
import { useQuery } from '@apollo/client';
import { GET_SENDER_STREAMS, GET_RECIPIENT_STREAMS } from '../graphql/streams'

const NoteDecoder = ({ render, zkNote, noteHash }) => {
  const [note, setNote] = useState({});
  
  useEffect(
    () => {
      if (zkNote) zkNote(noteHash).then(note => setNote(note))},
    [zkNote, noteHash]
  );
  console.log(note)

  return render(note)
};

const StreamDisplay = ({ stream, note, aztec, streamContractInstance, userAddress, role }) => {
  const [timePercentage, setTimePercentage] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTimePercentage = calculateTime(
        Number(stream.startTime) * 1000,
        Number(stream.stopTime) * 1000,
      );
      setTimePercentage(newTimePercentage.toFixed(2))
    }, 1000)
    return () => {console.log("CLEARING"); clearInterval(intervalId)}
  }, [stream.startTime, stream.stopTime]);

  useEffect(() => {
    const timeBetweenNotes = (stream.stopTime-stream.lastWithdrawTime)/note.value
    const intervalId = setInterval(async () => {
      const maxWithdrawalValue = await calculateMaxWithdrawalValue(stream, note.value)
      setAvailableBalance(maxWithdrawalValue)
    }, timeBetweenNotes/2 * 1000)
    return () => {console.log("CLEARING"); clearInterval(intervalId)}
  }, [stream, note.value]);

  const withdrawPercentage = calculateTime(
    Number(stream.startTime),
    Number(stream.stopTime),
    Number(stream.lastWithdrawTime),
  );

  return (
    <Grid 
      item
      container
      direction="column"
      alignItems="stretch"
      spacing={3}
      >

      <Grid item container justify="space-between">
        <Grid item>
          {role === "recipient" ?
            `Sender: ${stream.sender.slice(0,6)}...${stream.sender.slice(-5,-1)}` :
            `Receiver: ${stream.recipient.slice(0,6)}...${stream.recipient.slice(-5,-1)}`
          }    
        </Grid>
        <Grid item>
            Asset: {stream.zkAsset.id.slice(0,6)}...{stream.zkAsset.id.slice(-5,-1)}
        </Grid>
      </Grid>
      <Grid item container justify="space-between">
        <Grid item>
        Start:{' '}{moment.unix(stream.startTime).format('DD-MM-YYYY HH:mm')}
        </Grid>
        <Grid item>
          Stop:{' '}{moment.unix(stream.stopTime).format('DD-MM-YYYY HH:mm')}
        </Grid>
      </Grid>
      <Grid item>
        Streamed: {timePercentage}%
        <LinearProgress variant="determinate" value={timePercentage} />
        <LinearProgress variant="determinate" value={withdrawPercentage} color="secondary" />
        Withdrawn: {withdrawPercentage}%
      </Grid>
      {role === "recipient" && 
        <>
          <Grid item>
            {`${availableBalance}/${note.value} ZkDAI`} available to withdraw
          </Grid>
          <Grid item container justify="space-between">
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => cancelStream(aztec, streamContractInstance, stream.id, userAddress)}
                >
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => withdrawFunds(aztec, streamContractInstance, stream.id, userAddress)}
                >
                Withdraw
              </Button>
            </Grid>
          </Grid>
        </>
      }
      
    </Grid>
  );
};

StreamDisplay.propTypes = {
  streamContractInstance: PropTypes.object.isRequired,
  stream: PropTypes.object.isRequired,
  aztec: PropTypes.object.isRequired,
  userAddress: PropTypes.string.isRequired
};

const Status = ({
  role,
  userAddress,
  streamContractInstance,
  aztec,
}) => {
  const { loading, error, data } = useQuery(
    role === "sender" ? GET_SENDER_STREAMS : GET_RECIPIENT_STREAMS,
    { variables: { address: userAddress } }
  );
  console.log("GraphQL", loading, error, data)

  if (loading || error) return null
  const streamInProgress = data.streams.filter(stream => stream.cancellation == null)

  return (
    <Grid
        container
        direction="column"
        justify="center"
        alignItems='center'
        spacing={3}
      >
      {streamInProgress.length > 0 ? streamInProgress.map(stream => 
        <NoteDecoder
          zkNote={aztec.zkNote}
          noteHash={stream.noteHash}
          render={note => 
            <StreamDisplay
              stream={stream}
              note={note}
              aztec={aztec}
              streamContractInstance={streamContractInstance}
              key={stream.currentBalance}
              userAddress={userAddress}
              role={role}
            />
          }
          />
        ):
        <Typography color='textSecondary'>
          No streams to display
        </Typography>
      }
    </Grid>
  );
};

Status.propTypes = {
  userAddress: PropTypes.string.isRequired,
  streamContractInstance: PropTypes.any.isRequired,
  zkNote: PropTypes.any.isRequired,
  zkdaiBalance: PropTypes.number.isRequired,
};

export default Status;
