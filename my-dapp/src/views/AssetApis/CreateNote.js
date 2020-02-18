import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
  Button,
} from '@aztec/guacamole-ui';
import isValidAddress from '../../utils/isValidAddress';
import Input from '../../components/Input';

class CreateNote extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      amount: '',
      numberOfInputNotes: '',
      numberOfOutputNotes: '',
      userAccess: '',
      amountError: '',
      numberOfInputNotesError: '',
      numberOfouNotesError: '',
      userAccessError: '',
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

  handleChangeUserAccess = (userAccess) => {
    this.setState({
      userAccess,
      userAccessError: '',
    });
  };

  handleCreateNote = () => {
    const {
      amount,
      numberOfInputNotes,
      numberOfOutputNotes,
      userAccess,
    } = this.state;

    let amountError = '';
    let numberOfInputNotesError = '';
    let numberOfOutputNotesError = '';
    let userAccessError = '';
    if (!amount) {
      amountError = 'Amount must be larger than 0.';
    }
    if (numberOfInputNotes === '0') {
      numberOfInputNotesError = 'Number of input notes must be larger than 0.';
    }
    if (numberOfOutputNotes === '0') {
      numberOfOutputNotesError = 'Number of output notes must be larger than 0.';
    }
    if (userAccess && !isValidAddress(userAccess)) {
      userAccessError = 'Invalid address.';
    }
    if (amountError || numberOfInputNotesError || numberOfOutputNotesError || userAccessError) {
      this.setState({
        amountError,
        numberOfInputNotesError,
        numberOfOutputNotesError,
        userAccessError,
      });
      return;
    }

    this.setState(
      {
        loading: true,
        error: null,
      },
      this.createNote,
    );
  };

  async createNote() {
    const {
      asset,
    } = this.props;
    const {
      amount,
      numberOfInputNotes,
      numberOfOutputNotes,
      userAccess,
    } = this.state;

    let error = null;
    try {
      await asset.createNoteFromBalance(
        amount,
        {
          numberOfInputNotes,
          numberOfOutputNotes,
          userAccess: userAccess ? [userAccess] : null,
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
      userAccess,
      amountError,
      numberOfInputNotesError,
      numberOfOutputNotesError,
      userAccessError,
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
          label="Share access with"
          value={userAccess}
          onChange={this.handleChangeUserAccess}
          error={userAccessError}
        />
        <Block padding="m">
          <Button
            text="Submit"
            onSubmit={this.handleCreateNote}
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

CreateNote.propTypes = {
  asset: PropTypes.shape({
    createNoteFromBalance: PropTypes.func.isRequired,
  }).isRequired,
};

export default CreateNote;
