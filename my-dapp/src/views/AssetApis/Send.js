import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
  Button,
} from '@aztec/guacamole-ui';
import isValidAddress from '../../utils/isValidAddress';
import Input from '../../components/Input';

class Send extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      amount: '',
      numberOfInputNotes: '',
      numberOfOutputNotes: '',
      recipient: '',
      amountError: '',
      numberOfInputNotesError: '',
      numberOfouNotesError: '',
      recipientError: '',
      error: null,
    };
  }

  handleChangeAmount = (amount) => {
    this.setState({
      amount,
      amountError: '',
    });
  };

  handleChangeNumberOfInputNotes = (numberOfInputNotes) => {
    this.setState({
      numberOfInputNotes,
      numberOfInputNotesError: '',
    });
  };

  handleChangeNumberOfOutputNotes = (numberOfOutputNotes) => {
    this.setState({
      numberOfOutputNotes,
      numberOfOutputNotesError: '',
    });
  };

  handleChangeRecipient = (recipient) => {
    this.setState({
      recipient,
      recipientError: '',
    });
  };

  handleSend = () => {
    const {
      amount,
      numberOfInputNotes,
      numberOfOutputNotes,
      recipient,
    } = this.state;

    let amountError = '';
    let numberOfInputNotesError = '';
    let numberOfOutputNotesError = '';
    let recipientError = '';
    if (!amount) {
      amountError = 'Amount must be larger than 0.';
    }
    if (numberOfInputNotes === '0') {
      numberOfInputNotesError = 'Number of input notes must be larger than 0.';
    }
    if (numberOfOutputNotes === '0') {
      numberOfOutputNotesError = 'Number of output notes must be larger than 0.';
    }
    if (recipient && !isValidAddress(recipient)) {
      recipientError = 'Invalid address.';
    }
    if (amountError || numberOfInputNotesError || numberOfOutputNotesError || recipientError) {
      this.setState({
        amountError,
        numberOfInputNotesError,
        numberOfOutputNotesError,
        recipientError,
      });
      return;
    }

    this.setState(
      {
        loading: true,
        error: null,
      },
      this.send,
    );
  };

  async send() {
    const {
      account,
      asset,
    } = this.props;
    const {
      amount,
      numberOfInputNotes,
      numberOfOutputNotes,
      recipient,
    } = this.state;

    let error = null;
    try {
      await asset.send(
        [
          {
            to: recipient || account.address,
            amount,
          },
        ],
        {
          numberOfInputNotes,
          numberOfOutputNotes,
        },
      );
    } catch (e) {
      error = e;
    }

    this.setState({
      loading: false,
      error,
    });
  }

  render() {
    const {
      loading,
      amount,
      numberOfInputNotes,
      numberOfOutputNotes,
      recipient,
      amountError,
      numberOfInputNotesError,
      numberOfOutputNotesError,
      recipientError,
      error,
    } = this.state;

    return (
      <div className="form-wrapper">
        <Input
          type="number"
          label="Amount"
          value={amount}
          onChange={this.handleChangeAmount}
          error={amountError}
        />
        <Input
          type="number"
          label="Number of input notes"
          placeholder="Leave blank to use default value"
          value={numberOfInputNotes}
          onChange={this.handleChangeNumberOfInputNotes}
          error={numberOfInputNotesError}
        />
        <Input
          type="number"
          label="Number of output notes"
          placeholder="Leave blank to use default value"
          value={numberOfOutputNotes}
          onChange={this.handleChangeNumberOfOutputNotes}
          error={numberOfOutputNotesError}
        />
        <Input
          label="Recipient"
          placeholder="Leave blank to send to your own account"
          value={recipient}
          onChange={this.handleChangeRecipient}
          error={recipientError}
        />
        <Block padding="m">
          <Button
            text="Send"
            onSubmit={this.handleSend}
            isLoading={loading}
          />
        </Block>
        {!!error && (
          <Block padding="xs m">
            <Text
              text={error.message}
              color="red"
              size="xxs"
            />
          </Block>
        )}
      </div>
    );
  }
}

Send.propTypes = {
  account: PropTypes.shape({
    address: PropTypes.string.isRequired,
  }).isRequired,
  asset: PropTypes.shape({
    send: PropTypes.func.isRequired,
  }).isRequired,
};

export default Send;
