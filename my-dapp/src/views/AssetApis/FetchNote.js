import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
  Button,
} from '@aztec/guacamole-ui';
import Input from '../../components/Input';

class FetchNote extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      notes: null,
      equalTo: '',
      greaterThan: '',
      lessThan: '',
      numberOfNotes: 1,
      error: null,
    };
  }

  handleChangeEqualTo = (equalTo) => {
    this.setState({
      equalTo,
    });
  };

  handleChangeGreaterThan = (greaterThan) => {
    this.setState({
      greaterThan,
    });
  };

  handleChangeLessThan = (lessThan) => {
    this.setState({
      lessThan,
    });
  };

  handleChangeNumberOfNotes = (numberOfNotes) => {
    this.setState({
      numberOfNotes,
    });
  };

  handleFetchNote = () => {
    this.setState(
      {
        loading: true,
        error: null,
      },
      this.fetchNote,
    );
  };

  async fetchNote() {
    const {
      asset,
    } = this.props;
    const {
      equalTo,
      greaterThan,
      lessThan,
      numberOfNotes,
    } = this.state;

    let notes = [];
    let error = null;
    try {
      notes = await asset.fetchNotesFromBalance({
        equalTo,
        greaterThan,
        lessThan,
        numberOfNotes,
      });
    } catch (e) {
      error = e;
    }

    this.setState({
      loading: false,
      notes,
      error,
    });
  }

  renderNotes() {
    const {
      notes,
    } = this.state;

    if (!notes) {
      return null;
    }

    return (
      <Block padding="m">
        {notes.length === 0 && (
          <Text
            text="Can't find any notes that meet the requirements."
            size="xxs"
          />
        )}
        {notes.map(({
          noteHash,
          value,
        }) => (
          <Block
            key={noteHash}
            padding="xs 0"
          >
            <Block bottom="xxs">
              <Text
                text={`${value}`}
                color="green"
                size="xxs"
                weight="semibold"
              />
            </Block>
            <Text
              text={noteHash}
              size="xxs"
            />
          </Block>
        ))}
      </Block>
    );
  }

  render() {
    const {
      loading,
      equalTo,
      greaterThan,
      lessThan,
      numberOfNotes,
      error,
    } = this.state;

    return (
      <div className="form-wrapper">
        <Input
          type="number"
          label="Equal to"
          value={equalTo}
          onChange={this.handleChangeEqualTo}
        />
        <Input
          type="number"
          label="Greater than"
          value={greaterThan}
          onChange={this.handleChangeGreaterThan}
        />
        <Input
          type="number"
          label="Less than"
          value={lessThan}
          onChange={this.handleChangeLessThan}
        />
        <Input
          type="number"
          label="Number of notes"
          value={numberOfNotes}
          onChange={this.handleChangeNumberOfNotes}
        />
        <Block padding="m">
          <Button
            text="Submit"
            onSubmit={this.handleFetchNote}
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
        {this.renderNotes()}
      </div>
    );
  }
}

FetchNote.propTypes = {
  asset: PropTypes.shape({
    fetchNotesFromBalance: PropTypes.func.isRequired,
  }).isRequired,
};

export default FetchNote;
