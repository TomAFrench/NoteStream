import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';

import moment from 'moment';
import { buildDividendProof, buildJoinSplitProof } from '../utils/proofs';


const Withdraw = ({
  aztec,
  userAddress,
  streamContractInstance,
  zkdaiBalance,
}) => {
  const [stream, setStream] = useState(null);

  async function buildProofs(streamObj) {
    const {
      proofData: proofData1,
      inputNotes, outputNotes,
    } = await buildDividendProof(streamObj, aztec.zkNote, aztec.user);
    const { proofData: proofData2 } = await buildJoinSplitProof(
      streamObj,
      streamContractInstance.options.address,
      inputNotes[0],
      outputNotes[0],
      aztec.user,
    );

    console.log('DividendProof', proofData1);
    console.log('JoinSplitProof', proofData2);

    return {
      proof1: proofData1,
      proof2: proofData2,
    };
  }

  async function withdrawFunds(streamId) {
    const streamObj = await streamContractInstance.methods.getStream(streamId).call();

    const { proof1, proof2 } = await buildProofs(streamObj);

    // withdraw up to now or to end of stream
    const now = moment.min(moment(), moment.unix(streamObj.stopTime));
    const lastWithdrawal = moment.unix(streamObj.startTime);
    const durationToWithdraw = moment.duration(now.diff(lastWithdrawal)).as('seconds');

    console.log(now, lastWithdrawal, durationToWithdraw);
    console.log(streamId, proof1, proof2, durationToWithdraw);
    const results = await streamContractInstance.methods.withdrawFromStream(
      streamId,
      proof1.encodeABI(),
      proof2.encodeABI(),
      durationToWithdraw,
    ).send({ from: userAddress });
    console.log(results);
  }

  return (
    <Grid
    container
    direction="column"
    justify="center"
    spacing={3}
  >
    <Grid item>
    <p style={{ marginBottom: 20 }}>
      Your zkDai Balance: {zkdaiBalance} ZkDai
    </p>
    </Grid>
    <Grid item>
      <TextField
      label="Stream ID"
      placeholder=""
      variant="outlined"
      value={stream}
      onChange={val => setStream(val.target.value)}
      fullWidth
    />
    </Grid>
    <Grid item>
      <Button
        variant="contained"
        color="primary"
        onClick={() => withdrawFunds(stream)}
        >
        Withdraw
      </Button>
    </Grid>
  </Grid>
  );
};

export default Withdraw;
