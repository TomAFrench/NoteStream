import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
  TextInput,
} from '@aztec/guacamole-ui';

class SelectAsset extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      assetAddress: '',
      assetAddressError: '',
    };
  }

  handleChangeAddress = (assetAddress) => {
    this.setState({
      assetAddress,
      assetAddressError: '',
    });
  };

  handleUseAsset = () => {
    const {
      assetAddress,
    } = this.state;
    if (!assetAddress.match(/^0x[a-z0-9]{40}$/i)) {
      this.setState({
        assetAddressError: 'Invalid asset address.',
      });
      return;
    }

    const {
      onSelectAsset,
    } = this.props;

    onSelectAsset(assetAddress);
  };

  renderForm() {
    const {
      assetAddress,
      assetAddressError,
    } = this.state;

    return (
      <Block
        padding="m 0"
      >
        <Text
          text="Use an existing asset"
          size="xxs"
        />
        <Block
          top="s"
          align="left"
        >
          <TextInput
            className="flex-free-expand"
            value={assetAddress}
            onChange={this.handleChangeAddress}
            icon={{
              name: 'search',
              size: 'l',
            }}
            onClickIcon={this.handleUseAsset}
            onSubmit={this.handleUseAsset}
          />
        </Block>
        {assetAddressError && (
          <Block top="xs">
            <Text
              text={assetAddressError}
              color="red"
              size="xxs"
            />
          </Block>
        )}
      </Block>
    );
  }

  render() {
    return (
      <Block padding="l">
        {this.renderForm()}
      </Block>
    );
  }
}

SelectAsset.propTypes = {
  onSelectAsset: PropTypes.func.isRequired,
};

export default SelectAsset;
