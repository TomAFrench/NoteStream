import React, { ReactElement } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import moment from 'moment';

import { Contract } from 'ethers';

import { withdrawFunds, cancelStream } from '../../utils/stream';
import { Stream, ZkNote } from '../../types/types';

import { useAztec } from '../../contexts/AztecContext';
import { useAddress } from '../../contexts/OnboardContext';
import { convertToTokenValueDisplay } from '../../utils/units/convertToTokenValue';
import DoubleProgressBar from '../display/DoubleProgressBar';
import useENSName from '../../hooks/useENSName';

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
  const displayName = useENSName(role === 'recipient' ? sender : recipient);

  const displayValue =
    note.value &&
    convertToTokenValueDisplay(
      note.value,
      zkAsset.scalingFactor,
      zkAsset.linkedToken.decimals,
    );

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

  if (!displayName || note.value === undefined || !zkAsset.symbol) {
    return null;
  }
  return (
    <TableRow key={stream.id}>
      <TableCell component="th" scope="row">
        {displayName}
      </TableCell>
      <TableCell align="right">{`${displayValue} ${zkAsset.symbol}`}</TableCell>
      <TableCell align="right">
        <DoubleProgressBar
          startTime={startTime}
          stopTime={stopTime}
          lastWithdrawTime={lastWithdrawTime}
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
