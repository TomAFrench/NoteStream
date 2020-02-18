import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
  Button,
} from '@aztec/guacamole-ui';
import isValidAddress from '../../utils/isValidAddress';
import Input from '../../components/Input';

class Deposit extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      amount: '',
      numberOfOutputNotes: '',
      recipient: '',
      amountError: '',
      numberOfOutputNotesError: '',
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

  handleDeposit = () => {
    const {
      amount,
      numberOfOutputNotes,
      recipient,
    } = this.state;

    let amountError = '';
    let numberOfOutputNotesError = '';
    let recipientError = '';
    if (!amount) {
      amountError = 'Amount must be larger than 0.';
    }
    if (numberOfOutputNotes === '0') {
      numberOfOutputNotesError = 'Number of output notes must be larger than 0.';
    }
    if (recipient && !isValidAddress(recipient)) {
      recipientError = 'Invalid address.';
    }
    if (amountError || numberOfOutputNotesError || recipientError) {
      this.setState({
        amountError,
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
      this.deposit,
    );
  };

  async deposit() {
    const {
      account,
      asset,
    } = this.props;
    const {
      amount,
      numberOfOutputNotes,
      recipient,
    } = this.state;

    let error = null;
    try {
      await asset.deposit(
        [
          {
            amount,
            to: recipient || account.address,
          },
        ],
        {
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
      numberOfOutputNotes,
      recipient,
      amountError,
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
          label="Number of output notes"
          placeholder="Leave blank to use default value"
          value={numberOfOutputNotes}
          onChange={this.handleChangeNumberOfOutputNotes}
          error={numberOfOutputNotesError}
        />
        <Input
          label="Recipient"
          placeholder="Leave blank to deposit to your own account"
          value={recipient}
          onChange={this.handleChangeRecipient}
          error={recipientError}
        />
        <Block padding="m">
          <Button
            text="Deposit"
            onSubmit={this.handleDeposit}
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

Deposit.propTypes = {
  account: PropTypes.shape({
    address: PropTypes.string.isRequired,
  }).isRequired,
  asset: PropTypes.shape({
    deposit: PropTypes.func.isRequired,
  }).isRequired,
};

export default Deposit;
