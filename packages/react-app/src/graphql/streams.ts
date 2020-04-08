import { gql } from '@apollo/client';

export const GET_RECIPIENT_STREAMS = gql`
  query getStreams($address: String!) {
    streams(where: { recipient: $address }) {
      id
      cancellation {
        id
      }
      lastWithdrawTime
      noteHash
      recipient
      sender
      startTime
      stopTime
      zkAsset {
        id
        symbol
      }
    }
  }
`;

export const GET_SENDER_STREAMS = gql`
  query getStreams($address: String!) {
    streams(where: { sender: $address }) {
      id
      cancellation {
        id
      }
      lastWithdrawTime
      noteHash
      recipient
      sender
      startTime
      stopTime
      zkAsset {
        id
        symbol
      }
    }
  }
`;
