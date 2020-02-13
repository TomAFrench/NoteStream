import React from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
  Loader,
} from '@aztec/guacamole-ui';

const Loading = ({
  message,
}) => (
  <Block padding="l">
    <Block padding="xxl 0">
      <Loader
        size="xxl"
      />
    </Block>
    {!!message && (
      <Text
        text={message}
      />
    )}
  </Block>
);

Loading.propTypes = {
  message: PropTypes.string,
};

Loading.defaultProps = {
  message: '',
};

export default Loading;
