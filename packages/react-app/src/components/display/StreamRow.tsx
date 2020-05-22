import React, { useState, useEffect, ReactElement } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import moment from 'moment';

import { Contract } from 'ethers';
import calculateTime from '../../utils/time';

import { withdrawFunds } from '../../utils/withdrawal';
import cancelStream from '../../utils/cancellation';
import { Stream, ZkNote } from '../../types/types';
import { useAztec } from '../../contexts/AztecContext';
import { useAddress } from '../../contexts/OnboardContext';

const StreamRow = ({
  stream,
  note,
  streamContractInstance,
  role,
}: {
  stream: Stream;
  note: ZkNote;
  streamContractInstance: Contract;
  role: string;
}): ReactElement => {
  const userAddress = useAddress();
  const aztec = useAztec();
  const {
    sender,
    recipient,
    id,
    startTime,
    lastWithdrawTime,
    stopTime,
    zkAsset,
  } = stream;
  const [timePercentage, setTimePercentage] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTimePercentage = calculateTime(
        moment.unix(startTime),
        moment.unix(stopTime),
      );
      setTimePercentage(parseFloat(newTimePercentage.toFixed(2)));
    }, 1000);
    return (): void => {
      clearInterval(intervalId);
    };
  }, [startTime, stopTime]);

  const withdrawPercentage = calculateTime(
    moment.unix(startTime),
    moment.unix(stopTime),
    moment.unix(lastWithdrawTime),
  );

  const address = role === 'recipient' ? sender : recipient;
  const button =
    role === 'recipient' ? (
      <Button
        variant="contained"
        color="primary"
        onClick={(): Promise<void> =>
          withdrawFunds(aztec, streamContractInstance, id)
        }
      >
        Withdraw
      </Button>
    ) : (
      <Button
        variant="contained"
        color="primary"
        onClick={(): Promise<void> =>
          cancelStream(aztec, streamContractInstance, id, userAddress)
        }
      >
        Cancel
      </Button>
    );
  return (
    <TableRow key={stream.id}>
      <TableCell component="th" scope="row">
        {address.slice(0, 6)}...{address.slice(-5, -1)}
      </TableCell>
      <TableCell align="right">{`${note.value} ${zkAsset.symbol}`}</TableCell>
      <TableCell align="right">
        <LinearProgress variant="determinate" value={timePercentage} />
        <LinearProgress
          variant="determinate"
          value={withdrawPercentage}
          color="secondary"
        />
      </TableCell>
      <TableCell align="right">
        {moment.unix(startTime).format('DD-MM-YYYY HH:mm')}
      </TableCell>
      <TableCell align="right">
        {moment.unix(stopTime).format('DD-MM-YYYY HH:mm')}
      </TableCell>
      <TableCell align="right">{button}</TableCell>
    </TableRow>
  );
};

StreamRow.propTypes = {
  streamContractInstance: PropTypes.instanceOf(Contract),
  note: PropTypes.object.isRequired,
  stream: PropTypes.object.isRequired,
  role: PropTypes.string.isRequired,
};

export default StreamRow;
