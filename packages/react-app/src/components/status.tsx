import React, { useState, useEffect, ReactElement } from 'react';
import PropTypes from 'prop-types';

import { useQuery } from '@apollo/client';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';

import CopyToClipboard from 'react-copy-to-clipboard';

import moment from 'moment';
import { GET_SENDER_STREAMS, GET_RECIPIENT_STREAMS } from '../graphql/streams';
import calculateTime from '../utils/time';

import { calculateWithdrawal, withdrawFunds } from '../utils/withdrawal';
import cancelStream from '../utils/cancellation';
import { Address, Hash, Stream } from '../types/types';

const NoteDecoder = ({ render, zkNote, noteHash }: { render: Function; zkNote: any; noteHash: Hash }): ReactElement => {
  const [note, setNote] = useState({});

  useEffect(() => {
    if (zkNote) {
      zkNote(noteHash).then((decodedNote: object) => setNote(decodedNote));
    }
  }, [zkNote, noteHash]);

  return render(note);
};

const StreamDisplay = ({
  stream,
  note,
  aztec,
  streamContractInstance,
  userAddress,
  role,
}: {
  stream: Stream;
  note: any;
  aztec: any;
  streamContractInstance: any;
  userAddress: Address;
  role: string;
}): ReactElement => {
  const [timePercentage, setTimePercentage] = useState<number>(0);
  const [availableBalance, setAvailableBalance] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTimePercentage = calculateTime(Number(stream.startTime) * 1000, Number(stream.stopTime) * 1000);
      setTimePercentage(parseFloat(newTimePercentage.toFixed(2)));
    }, 1000);
    return (): void => {
      clearInterval(intervalId);
    };
  }, [stream.startTime, stream.stopTime]);

  useEffect(() => {
    let timeoutId: number;

    function updateMaxWithdrawalValue(): void {
      const timeBetweenNotes = (stream.stopTime - stream.lastWithdrawTime) / note.value;
      const { withdrawalValue } = calculateWithdrawal(note.value, stream.lastWithdrawTime, stream.stopTime);
      setAvailableBalance(Math.max(withdrawalValue, 0));

      if (!withdrawalValue) {
        // If don't have a good max withdrawal value then check again quickly
        timeoutId = window.setTimeout(updateMaxWithdrawalValue, 1000, 1000);
      } else if (withdrawalValue !== note.value) {
        // If stream is not complete then recheck when a new note should be available
        timeoutId = window.setTimeout(updateMaxWithdrawalValue, (timeBetweenNotes / 2) * 1000, 1000);
      }
    }

    updateMaxWithdrawalValue();
    return (): void => {
      clearTimeout(timeoutId);
    };
  }, [stream, note.value]);

  const withdrawPercentage = calculateTime(
    Number(stream.startTime),
    Number(stream.stopTime),
    Number(stream.lastWithdrawTime),
  );

  return (
    <Grid item container direction="column" alignItems="stretch" spacing={3}>
      <Grid item container justify="space-between">
        <CopyToClipboard text={role === 'recipient' ? stream.sender : stream.recipient}>
          <Grid item>
            {role === 'recipient'
              ? `Sender: ${stream.sender.slice(0, 6)}...${stream.sender.slice(-5, -1)}`
              : `Receiver: ${stream.recipient.slice(0, 6)}...${stream.recipient.slice(-5, -1)}`}
          </Grid>
        </CopyToClipboard>
        <CopyToClipboard text={stream.zkAsset.id}>
          <Grid item>Asset: {stream.zkAsset.symbol}</Grid>
        </CopyToClipboard>
      </Grid>
      <Grid item container justify="space-between">
        <Grid item>Start: {moment.unix(stream.startTime).format('DD-MM-YYYY HH:mm')}</Grid>
        <Grid item>Stop: {moment.unix(stream.stopTime).format('DD-MM-YYYY HH:mm')}</Grid>
      </Grid>
      <Grid item>
        Streamed: {timePercentage}%
        <LinearProgress variant="determinate" value={timePercentage} />
        <LinearProgress variant="determinate" value={withdrawPercentage} color="secondary" />
        Withdrawn: {withdrawPercentage}%
      </Grid>
      {role === 'recipient' ? (
        <>
          <Grid item>{`${availableBalance}/${note.value} ${stream.zkAsset.symbol}`} available to withdraw</Grid>
          <Grid item container justify="space-between">
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={(): Promise<void> => cancelStream(aztec, streamContractInstance, stream.id, userAddress)}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={(): Promise<void> => withdrawFunds(aztec, streamContractInstance, stream.id, userAddress)}
              >
                Withdraw
              </Button>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Grid item>{`${availableBalance}/${note.value} ${stream.zkAsset.symbol}`} streamed to recipient</Grid>
          <Grid item container justify="flex-end">
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={(): Promise<void> => cancelStream(aztec, streamContractInstance, stream.id, userAddress)}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
};

StreamDisplay.propTypes = {
  streamContractInstance: PropTypes.object.isRequired,
  note: PropTypes.object.isRequired,
  stream: PropTypes.object.isRequired,
  aztec: PropTypes.object.isRequired,
  userAddress: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
};

const Status = ({
  role,
  userAddress,
  streamContractInstance,
  aztec,
}: {
  role: string;
  userAddress: Address;
  streamContractInstance: any;
  aztec: any;
}): ReactElement => {
  const { loading, error, data } = useQuery(role === 'sender' ? GET_SENDER_STREAMS : GET_RECIPIENT_STREAMS, {
    variables: { address: userAddress || '' },
    fetchPolicy: 'network-only',
  });

  let content;
  if (!aztec || !aztec.enabled || loading || error) {
    content = <CircularProgress />;
  } else {
    const streamInProgress = data.streams.filter((stream: Stream) => stream.cancellation == null);
    content =
      streamInProgress.length > 0 ? (
        streamInProgress.map((stream: Stream) => (
          <NoteDecoder
            zkNote={aztec.zkNote}
            noteHash={stream.noteHash}
            key={stream.id}
            render={(note: object): ReactElement => (
              <StreamDisplay
                stream={stream}
                note={note}
                aztec={aztec}
                streamContractInstance={streamContractInstance}
                userAddress={userAddress}
                role={role}
              />
            )}
          />
        ))
      ) : (
        <Typography color="textSecondary">No streams to display</Typography>
      );
  }

  return (
    <Grid container direction="column" justify="center" alignItems="center" spacing={3}>
      {content}
    </Grid>
  );
};

Status.propTypes = {
  userAddress: PropTypes.string.isRequired,
  streamContractInstance: PropTypes.any.isRequired,
  role: PropTypes.string.isRequired,
  aztec: PropTypes.object.isRequired,
};

export default Status;
