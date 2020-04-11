import React, { ReactElement } from 'react';
import PropTypes from 'prop-types';

import { useQuery } from '@apollo/client';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

import NoteDecoder from './NoteDecoder';
import StreamDisplay from './display/StreamDisplay';

import { GET_SENDER_STREAMS, GET_RECIPIENT_STREAMS } from '../graphql/streams';

import { Address, Stream } from '../types/types';

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

  if (loading || error) {
    return (
      <Grid container direction="column" justify="center" alignItems="center" spacing={3}>
        <CircularProgress />
      </Grid>
    );
  }

  const streamInProgress = data.streams.filter((stream: Stream) => stream.cancellation == null);
  if (streamInProgress.length === 0) {
    return (
      <Grid container direction="column" justify="center" alignItems="center" spacing={3}>
        <Typography color="textSecondary">No streams to display</Typography>
      </Grid>
    );
  }
  return streamInProgress.map((stream: Stream) => (
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
  ));
};

Status.propTypes = {
  userAddress: PropTypes.string.isRequired,
  streamContractInstance: PropTypes.any.isRequired,
  role: PropTypes.string.isRequired,
  aztec: PropTypes.object.isRequired,
};

export default Status;
