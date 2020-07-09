import React, { ReactElement, useCallback } from 'react';
import moment from 'moment';

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { useQuery } from '@apollo/client';
import { Contract } from '@ethersproject/contracts';
import { Button, Grid, CircularProgress } from '@material-ui/core';
import { generateColumns, STREAM_TABLE_ID, Column } from '../Table/columns';
import { cellWidth } from '../Table/TableHead';
import Table from '../Table';

import {
  GET_SENDER_STREAMS,
  GET_RECIPIENT_STREAMS,
} from '../../graphql/streams';
import { useAddress } from '../../contexts/OnboardContext';
import { Stream, Hash, ZkNote } from '../../types/types';
import { cancelStream } from '../../utils/stream';
import { convertToTokenValueDisplay } from '../../utils/units/convertToTokenValue';

import { useAztec } from '../../contexts/AztecContext';
import useDecodedNote from '../../hooks/useDecodedNote';
import useENSName from '../../hooks/useENSName';
import DoubleProgressBar from '../display/DoubleProgressBar';

type HumanReadableStream = {
  id: number;
  recipient: string;
  sender: string;
  noteHash: Hash;
  humanDeposit: string;
  humanStartTime: string;
  humanStopTime: string;

  zkAsset: any;
};
type TableRowData = HumanReadableStream & {
  humanStartTimeOrder: number;
  humanStopTimeOrder: number;
  humanLastWithdrawTimeOrder: number;
  cancelStream: Function;
};

const humanReadableStream = (stream: Stream): HumanReadableStream => {
  const {
    id,
    recipient,
    noteHash,
    sender,
    startTime,
    stopTime,
    zkAsset,
  } = stream;
  const humanStartTime: string = moment
    .unix(startTime)
    .format('MMM D, YYYY - HH:mm');
  const humanStopTime: string = moment
    .unix(stopTime)
    .format('MMM D, YYYY - HH:mm');
  const humanDeposit = '';

  return {
    id,
    recipient,
    sender,
    noteHash,
    humanDeposit,
    humanStartTime,
    humanStopTime,
    zkAsset,
  };
};

function NewStreamTable({
  role,
  streamContract,
}: {
  role: 'sender' | 'recipient';
  streamContract: Contract;
}): ReactElement {
  const userAddress = useAddress();
  const aztec = useAztec();
  const { loading, error, data } = useQuery(
    role === 'sender' ? GET_SENDER_STREAMS : GET_RECIPIENT_STREAMS,
    {
      variables: { address: userAddress || '' },
      fetchPolicy: 'network-only',
    },
  );

  const cancelSelectedStream = useCallback(
    (id) => cancelStream(aztec, streamContract, id, userAddress),
    [aztec, streamContract, userAddress],
  );

  if (loading || error) {
    return (
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={3}
      >
        <CircularProgress />
      </Grid>
    );
  }

  const columns = generateColumns();

  const streamInProgress = data.streams.filter(
    (stream: Stream) => stream.cancellation == null,
  );
  console.log(streamInProgress);

  const tableContents: TableRowData[] = streamInProgress.map(
    (stream: Stream) => ({
      ...humanReadableStream(stream),
      humanStartTimeOrder: stream.startTime,
      humanStopTimeOrder: stream.stopTime,
      humanLastWithdrawTimeOrder: stream.lastWithdrawTime,
    }),
  );
  return (
    <Table
      columns={columns}
      data={tableContents}
      defaultFixed
      defaultOrder="desc"
      defaultOrderBy={STREAM_TABLE_ID}
      defaultRowsPerPage={25}
      label="Transactions"
      size={tableContents.length}
      disableLoadingOnEmptyTable
    >
      {(sortedData: TableRowData[]): any =>
        sortedData.map((row: TableRowData) => (
          <NewStreamRow
            key={row.id}
            role={role}
            row={row}
            columns={columns}
            cancelSelectedStream={cancelSelectedStream}
          />
        ))
      }
    </Table>
  );
}

const NewStreamRow = ({
  role,
  row,
  columns,
  cancelSelectedStream,
}: {
  role: 'sender' | 'recipient';
  row: TableRowData;
  columns: Column[];
  cancelSelectedStream: Function;
}): ReactElement => {
  const {
    id,
    humanStartTime,
    humanStopTime,
    noteHash,
    recipient,
    sender,
    humanStartTimeOrder,
    humanStopTimeOrder,
    humanLastWithdrawTimeOrder,
    zkAsset,
  }: TableRowData = row;
  const note: ZkNote | undefined = useDecodedNote(noteHash);
  const displayName = useENSName(role === 'sender' ? recipient : sender);
  const displayValue =
    note?.value &&
    convertToTokenValueDisplay(
      note.value,
      zkAsset.scalingFactor,
      zkAsset.linkedToken.decimals,
    );

  return (
    <TableRow key={id} tabIndex={-1}>
      <TableCell
        align={columns[0].align}
        component="td"
        key={columns[0].id}
        style={cellWidth(columns[0].width)}
      >
        {id}
      </TableCell>
      <TableCell
        align={columns[1].align}
        component="td"
        key={columns[1].id}
        style={cellWidth(columns[1].width)}
      >
        {displayName}
      </TableCell>
      <TableCell
        align={columns[2].align}
        component="td"
        key={columns[2].id}
        style={cellWidth(columns[2].width)}
      >
        {`${displayValue} ${zkAsset.symbol}`}
      </TableCell>
      <TableCell
        align={columns[3].align}
        component="td"
        key={columns[3].id}
        style={cellWidth(columns[3].width)}
      >
        <DoubleProgressBar
          startTime={humanStartTimeOrder}
          stopTime={humanStopTimeOrder}
          lastWithdrawTime={humanLastWithdrawTimeOrder}
        />
      </TableCell>
      <TableCell
        align={columns[4].align}
        component="td"
        key={columns[4].id}
        style={cellWidth(columns[4].width)}
      >
        {humanStartTime}
      </TableCell>
      <TableCell
        align={columns[5].align}
        component="td"
        key={columns[5].id}
        style={cellWidth(columns[5].width)}
      >
        {humanStopTime}
      </TableCell>
      <TableCell component="td">
        <Button
          color="primary"
          variant="contained"
          onClick={(): Promise<void> => cancelSelectedStream(row.id)}
        >
          Cancel
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default NewStreamTable;
