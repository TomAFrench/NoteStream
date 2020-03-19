import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import moment from 'moment';
import LinearProgress from '@material-ui/core/LinearProgress';
import calculateTime from '../utils/time';

const StreamDisplay = ({ stream, zkNote }) => {
  const [noteValue, setNoteValue] = useState(stream.noteHash);


  useEffect(() => {
    async function decodeNote(noteHash) {
      const note = await zkNote(noteHash);
      setNoteValue(note.value);
    }

    decodeNote(stream.currentBalance);
  }, [zkNote, stream.currentBalance]);

  const timePercentage = calculateTime(
    Number(stream.startTime) * 1000,
    Number(stream.stopTime) * 1000,
  );
  const withdrawPercentage = calculateTime(
    Number(stream.startTime),
    Number(stream.stopTime),
    Number(stream.lastWithdrawTime),
  );
  return (
    <Grid item>
      <p>Stream: {stream.streamId} </p>
      <p>Sender: {stream.sender} </p>
      <p>Receiver: {stream.recipient} </p>
      <p>
        StartTime:{' '}
        {moment.unix(stream.startTime).format('DD-MM-YYYY HH:mm')}
      </p>
      <p>
        StopTime:{' '}
        {moment.unix(stream.stopTime).format('DD-MM-YYYY HH:mm')}
      </p>
      <p>Remaining balance on stream: {noteValue}</p>
      <p style={{ marginTop: 30 }}>Time passed:</p>
      <LinearProgress variant="determinate" value={timePercentage} />
      <p style={{ marginTop: 30 }}>Money withdrawn</p>
      <LinearProgress variant="determinate" value={withdrawPercentage} color="secondary" />
    </Grid>
  );
};

async function getStreams(streamContractInstance, userAddress, role) {
  const events = await streamContractInstance.getPastEvents(
    'CreateStream',
    { filter: { [role]: userAddress }, fromBlock: 0, toBlock: 'latest' },
  );

  return Promise.all(events.map(async (e) => {
    const stream = await streamContractInstance.methods
      .getStream(e.returnValues.streamId)
      .call({
        from: userAddress,
      });
    return {
      streamId: e.returnValues.streamId,
      ...stream,
    };
  }));
}

StreamDisplay.propTypes = {
  stream: PropTypes.object.isRequired,
  zkNote: PropTypes.func.isRequired,
};

const Status = ({
  userAddress,
  streamContractInstance,
  zkNote,
  zkdaiBalance,
}) => {
  const [senderStreams, setSenderStreams] = useState([]);
  const [recipientStreams, setRecipientStreams] = useState([]);


  useEffect(() => {
    async function loadStreams() {
      if (!streamContractInstance) return;
      const newSenderStreams = await getStreams(streamContractInstance, userAddress, 'sender');
      const newRecipientStreams = await getStreams(streamContractInstance, userAddress, 'recipient');
      console.log(newSenderStreams);
      setSenderStreams(newSenderStreams);
      setRecipientStreams(newRecipientStreams);
    }
    loadStreams();
  }, [userAddress, streamContractInstance, zkdaiBalance]);

  if (!streamContractInstance) return null;
  return (
    <Grid
        container
        direction="column"
        justify="center"
        alignItems='center'
        spacing={3}
      >

      <Grid item>
        Sender streams
      </Grid>
      {senderStreams.map(stream => <StreamDisplay
          zkNote={zkNote}
          stream={stream}
          key={stream.currentBalance}
          />)}
      <Grid item>
        Recipient streams
      </Grid>
      {recipientStreams.map(stream => <StreamDisplay
          zkNote={zkNote}
          stream={stream}
          key={stream.currentBalance}
          />)}
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
