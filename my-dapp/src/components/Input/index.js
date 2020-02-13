import React from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
  TextInput,
  MaskedNumberInput,
} from '@aztec/guacamole-ui';

const Input = ({
  type,
  label,
  error,
  ...inputProps
}) => {
  const Tag = type === 'text'
    ? TextInput
    : MaskedNumberInput;
  return (
    <Block padding="m">
      <Block bottom="xs">
        <Text
          text={label}
          size="xxs"
        />
      </Block>
      <Tag {...inputProps} />
      {error && (
        <Block top="xs">
          <Text
            text={error}
            color="red"
            size="xxs"
          />
        </Block>
      )}
    </Block>
  );
};

Input.propTypes = {
  type: PropTypes.oneOf(['text', 'number']),
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
};

Input.defaultProps = {
  type: 'text',
  error: '',
};

export default Input;
