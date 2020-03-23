import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';

import { calculateWithdrawal, buildDividendProof, buildJoinSplitProof } from '../utils/proofs';
import moment from 'moment';


const Withdraw = ({
  aztec,
  userAddress,
  streamContractInstance,
  zkdaiBalance,
}) => {
  const [stream, setStream] = useState(null);

  async function buildProofs(streamObj, withdrawalValue) {

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

  async function withdrawFunds(streamId) {
    const streamObj = await streamContractInstance.methods.getStream(streamId).call();

    // Calculate what value of the stream is redeemable
    const {
      withdrawalValue,
      withdrawalDuration
    } = await calculateWithdrawal(streamObj, aztec)

    const { proof1, proof2 } = await buildProofs(streamObj, withdrawalValue, withdrawalDuration);

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

Withdraw.propTypes = {
  aztec: PropTypes.object.isRequired,
  userAddress: PropTypes.string.isRequired,
  streamContractInstance: PropTypes.object.isRequired,
  zkdaiBalance: PropTypes.number.isRequired,
};

export default Withdraw;
