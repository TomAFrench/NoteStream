import React, { useState, useEffect, ReactElement, useMemo } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import moment from 'moment';

import { Contract } from 'ethers';
import calculateTime from '../../utils/time';

import { withdrawFunds, cancelStream } from '../../utils/stream';
import { Stream, ZkNote } from '../../types/types';

import { useAztec } from '../../contexts/AztecContext';
import { useAddress } from '../../contexts/OnboardContext';
import { convertToTokenValueDisplay } from '../../utils/convertToTokenValue';

const StreamRow = ({
  stream,
  note,
  streamContract,
  role,
}: {
  stream: Stream;
  note: ZkNote;
  streamContract: Contract;
  role: string;
}): ReactElement | null => {
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

  const displayValue =
    note.value &&
    convertToTokenValueDisplay(
      note.value,
      zkAsset.scalingFactor,
      zkAsset.linkedToken.decimals,
    );

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

  const withdrawPercentage = useMemo(
    () =>
      calculateTime(
        moment.unix(startTime),
        moment.unix(stopTime),
        moment.unix(lastWithdrawTime),
      ),
    [startTime, stopTime, lastWithdrawTime],
  );

  const address = role === 'recipient' ? sender : recipient;
  const button =
    role === 'recipient' ? (
      <Button
        variant="contained"
        color="primary"
        onClick={(): Promise<void> => withdrawFunds(aztec, streamContract, id)}
      >
        Withdraw
      </Button>
    ) : (
      <Button
        variant="contained"
        color="primary"
        onClick={(): Promise<void> =>
          cancelStream(aztec, streamContract, id, userAddress)
        }
      >
        Cancel
      </Button>
    );

  if (
    !address ||
    note.value === undefined ||
    !zkAsset.symbol ||
    !startTime ||
    !stopTime
  ) {
    return null;
  }
  return (
    <TableRow key={stream.id}>
      <TableCell component="th" scope="row">
        {address.slice(0, 6)}...{address.slice(-5, -1)}
      </TableCell>
      <TableCell align="right">{`${displayValue} ${zkAsset.symbol}`}</TableCell>
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
  streamContract: PropTypes.instanceOf(Contract),
  note: PropTypes.object.isRequired,
  stream: PropTypes.object.isRequired,
  role: PropTypes.string.isRequired,
};

export default StreamRow;
