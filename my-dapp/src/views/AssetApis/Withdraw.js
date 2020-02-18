import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
  Button,
} from '@aztec/guacamole-ui';
import isValidAddress from '../../utils/isValidAddress';
import Input from '../../components/Input';

class Withdraw extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      amount: '',
      numberOfInputNotes: '',
      recipient: '',
      amountError: '',
      numberOfInputNotesError: '',
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

  handleChangeRecipient = (recipient) => {
    this.setState({
      recipient,
      recipientError: '',
    });
  };

  handleWithdraw = () => {
    const {
      amount,
      numberOfInputNotes,
      recipient,
    } = this.state;

    let amountError = '';
    let numberOfInputNotesError = '';
    let recipientError = '';
    if (!amount) {
      amountError = 'Amount must be larger than 0.';
    }
    if (numberOfInputNotes === '0') {
      numberOfInputNotesError = 'Number of input notes must be larger than 0.';
    }
    if (recipient && !isValidAddress(recipient)) {
      recipientError = 'Invalid address.';
    }
    if (amountError || numberOfInputNotesError || recipientError) {
      this.setState({
        amountError,
        numberOfInputNotesError,
        recipientError,
      });
      return;
    }

    this.setState(
      {
        loading: true,
        error: null,
      },
      this.withdraw,
    );
  };

  async withdraw() {
    const {
      account,
      asset,
    } = this.props;
    const {
      amount,
      numberOfInputNotes,
      recipient,
    } = this.state;

    let error = null;
    try {
      await asset.withdraw(
        amount,
        {
          to: recipient || account.address,
          numberOfInputNotes,
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
      recipient,
      amountError,
      numberOfInputNotesError,
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
          label="Recipient"
          placeholder="Leave blank to withdraw to your own account"
          value={recipient}
          onChange={this.handleChangeRecipient}
          error={recipientError}
        />
        <Block padding="m">
          <Button
            text="Withdraw"
            onSubmit={this.handleWithdraw}
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

Withdraw.propTypes = {
  account: PropTypes.shape({
    address: PropTypes.string.isRequired,
  }).isRequired,
  asset: PropTypes.shape({
    withdraw: PropTypes.func.isRequired,
  }).isRequired,
};

export default Withdraw;
