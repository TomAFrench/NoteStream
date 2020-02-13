import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  FlexBox,
  Block,
  Text,
  Icon,
  Clickable,
} from '@aztec/guacamole-ui';
import Separator from '../../components/Separator';
import CreateAsset from '../CreateAsset';
import SelectAsset from '../SelectAsset';
import Asset from '../Asset';
import styles from './account.module.scss';

class Account extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      assetAddress: '',
    };
  }

  handleUseAsset = (assetAddress) => {
    this.setState({
      assetAddress,
    });
  };

  handleClearAsset = () => {
    this.setState({
      assetAddress: '',
    });
  };

  renderBackButton() {
    const {
      assetAddress,
    } = this.state;

    if (!assetAddress) {
      return null;
    }

    return (
      <div className={styles['back-button']}>
        <Clickable
          onClick={this.handleClearAsset}
        >
          <Icon
            name="reply"
            size="xxl"
            color="grey-light"
          />
        </Clickable>
      </div>
    );
  }

  renderProfile() {
    const {
      account,
      network,
    } = this.props;

    return (
      <div>
        <Block padding="m 0">
          <Text
            text={`User Account: ${account.address}`}
          />
        </Block>
        <Block padding="m 0">
          <Text
            text={`Network: ${network.name} (${network.id})`}
          />
        </Block>
      </div>
    );
  }

  render() {
    const {
      account,
    } = this.props;
    const {
      assetAddress,
    } = this.state;

    return (
      <Block
        className={styles['section-account']}
        padding="l"
      >
        {this.renderBackButton()}
        {this.renderProfile()}
        <Block padding="xl 0">
          {!assetAddress && (
            <FlexBox
              align="center"
              expand
            >
              <div className="form-wrapper">
                <CreateAsset
                  account={account}
                  onCreateNewAsset={this.handleUseAsset}
                />
                <Block padding="m 0">
                  <Separator
                    text="or"
                  />
                </Block>
                <SelectAsset
                  onSelectAsset={this.handleUseAsset}
                />
              </div>
            </FlexBox>
          )}
          {assetAddress && (
            <Asset
              account={account}
              assetAddress={assetAddress}
            />
          )}
        </Block>
      </Block>
    );
  }
}

Account.propTypes = {
  account: PropTypes.shape({
    address: PropTypes.string.isRequired,
  }).isRequired,
  network: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default Account;
