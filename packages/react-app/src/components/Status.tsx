import React, { ReactElement } from 'react';
import PropTypes from 'prop-types';

import { useQuery } from '@apollo/client';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { Contract } from 'ethers';
import NoteDecoder from './NoteDecoder';

import { GET_SENDER_STREAMS, GET_RECIPIENT_STREAMS } from '../graphql/streams';

import { Stream, ZkNote } from '../types/types';
import { useAztec } from '../contexts/AztecContext';
import { useAddress } from '../contexts/OnboardContext';
import StreamRow from './display/StreamRow';

const Status = ({
  role,
  streamContractInstance,
}: {
  role: string;
  streamContractInstance: Contract;
}): ReactElement => {
  const userAddress = useAddress();
  const aztec = useAztec();
  const { loading, error, data } = useQuery(
    role === 'sender' ? GET_SENDER_STREAMS : GET_RECIPIENT_STREAMS,
    {
      variables: { address: userAddress || '' },
      fetchPolicy: 'network-only',
    },
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

  const streamInProgress = data.streams.filter(
    (stream: Stream) => stream.cancellation == null,
  );
  if (streamInProgress.length === 0) {
    return (
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={3}
      >
        <Typography color="textSecondary">No streams to display</Typography>
      </Grid>
    );
  }

  const tableContents = streamInProgress.map((stream: Stream) => (
    <NoteDecoder
      zkNote={aztec.zkNote}
      noteHash={stream.noteHash}
      key={stream.id}
      render={(note: ZkNote): ReactElement => (
        <StreamRow
          stream={stream}
          note={note}
          streamContractInstance={streamContractInstance}
          role={role}
        />
      )}
    />
  ));
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>{role === 'recipient' ? 'Sender' : 'Recipient'}</TableCell>
          <TableCell align="right">Value remaining</TableCell>
          <TableCell align="right">Progress</TableCell>
          <TableCell align="right">Start time</TableCell>
          <TableCell align="right">End time</TableCell>
          <TableCell align="right"></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>{tableContents}</TableBody>
    </Table>
  );
};

Status.propTypes = {
  streamContractInstance: PropTypes.any.isRequired,
  role: PropTypes.string.isRequired,
};

export default Status;
