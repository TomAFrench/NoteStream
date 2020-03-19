import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';


import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import moment from 'moment';
import LinearProgress from '@material-ui/core/LinearProgress';
import calculateTime from '../utils/time';
import { calculateWithdrawal, buildDividendProof, buildJoinSplitProof } from '../utils/proofs';


async function buildProofs(aztec, streamContractInstance, streamObj, withdrawalValue) {

  console.log("contract", streamContractInstance)
  const {
    proofData: proofData1,
    inputNotes, outputNotes,
  } = await buildDividendProof(streamObj, streamContractInstance.options.address, withdrawalValue, aztec);

  const { proofData: proofData2 } = await buildJoinSplitProof(
    streamObj,
    streamContractInstance.options.address,
    inputNotes[0],
    outputNotes[0],
    aztec,
  );

  return {
    proof1: proofData1,
    proof2: proofData2,
  };
}

async function withdrawFunds(aztec, streamContractInstance, streamId, userAddress) {
  const streamObj = await streamContractInstance.methods.getStream(streamId).call();

  // Calculate what value of the stream is redeemable
  const {
    withdrawalValue,
    withdrawalDuration
  } = await calculateWithdrawal(streamObj, aztec)

  const { proof1, proof2 } = await buildProofs(aztec, streamContractInstance, streamObj, withdrawalValue);

  console.log("Withdrawing from stream:", streamId)
  console.log("Withdrawal duration:", withdrawalDuration)
  console.log("Remaining stream duration:", moment.duration(moment.unix(streamObj.stopTime).diff(moment.unix(streamObj.lastWithdrawTime))).asSeconds())
  console.log("Proofs:", proof1, proof2);
  const results = await streamContractInstance.methods.withdrawFromStream(
    streamId,
    proof1.encodeABI(),
    proof2.encodeABI(streamObj.tokenAddress),
    withdrawalDuration,
  ).send({ from: userAddress });
  console.log(results);
}

const StreamDisplay = ({ stream, aztec, streamContractInstance, userAddress, role }) => {
  const [noteValue, setNoteValue] = useState(stream.noteHash);


  useEffect(() => {
    async function decodeNote(noteHash) {
      const note = await aztec.zkNote(noteHash);
      setNoteValue(note.value);
    }

    decodeNote(stream.currentBalance);
  }, [aztec, stream.currentBalance]);

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
    <Grid 
      item
      container
      direction="column"
      alignItems="stretch"
      spacing={3}
      >
      <Grid item>
        {role === "recipient" ?
          `Sender: ${stream.sender}` :
          `Receiver: ${stream.recipient}`
        }    
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
        Remaining balance on stream: {noteValue}
      </Grid>
      <Grid item>
        Time passed <LinearProgress variant="determinate" value={timePercentage} />
      </Grid>
      <Grid item>
        Money withdrawn <LinearProgress variant="determinate" value={withdrawPercentage} color="secondary" />
      </Grid>
      {role === "recipient" &&
        <Grid item container justify="center">
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => withdrawFunds(aztec, streamContractInstance, stream.streamId, userAddress)}
              >
              Withdraw
            </Button>
          </Grid>
        </Grid>
      }
      
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
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    async function loadStreams() {
      if (!streamContractInstance) return;
      const streams = await getStreams(streamContractInstance, userAddress, role);
      console.log(streams);
      setStreams(streams);
    }
    loadStreams();
  }, [userAddress, streamContractInstance, role]);

  if (!streamContractInstance) return null;
  return (
    <Grid
        container
        direction="column"
        justify="center"
        alignItems='center'
        spacing={3}
      >
      {streams.map(stream => <StreamDisplay
          stream={stream}
          aztec={aztec}
          streamContractInstance={streamContractInstance}
          key={stream.currentBalance}
          userAddress={userAddress}
          role={role}
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
