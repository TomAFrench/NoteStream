import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  FlexBox,
  Block,
  Text,
} from '@aztec/guacamole-ui';
import AssetApis from '../AssetApis';

class Asset extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      asset: null,
      balance: '',
      balanceOfLinkedToken: '',
      allowance: '',
    };
  }

  componentDidMount() {
    this.initAsset();
  }

  async initAsset() {
    const {
      assetAddress,
    } = this.props;
    let asset;
    try {
      asset = await window.aztec.zkAsset(assetAddress);
    } catch (error) {
      console.error(error);
      return;
    }

    let balance = 0;
    if (asset.valid) {
      balance = await asset.balance();
      asset.subscribeToBalance(this.updateAssetBalance);
    }

    this.setState(
      {
        asset,
        balance,
      },
      () => this.updateAssetBalance(balance),
    );
  }

  updateAssetBalance = async (balance) => {
    await this.refreshAssetBalance();

    this.setState({
      balance,
    });
  };

  refreshAssetBalance = async () => {
    const {
      asset,
    } = this.state;
    const {
      account,
    } = this.props;
    const balanceOfLinkedToken = await asset.balanceOfLinkedToken();
    const allowance = await asset.allowanceOfLinkedToken(
        account.address,
        window.aztec.web3.getAddress('AccountRegistry'),
    );

    this.setState({
      balanceOfLinkedToken,
      allowance,
    });
  };

  renderAssetInfo() {
    const {
      assetAddress,
    } = this.props;
    const {
      asset,
      balance,
      balanceOfLinkedToken,
      allowance,
    } = this.state;

    return (
      <Block align="left">
        <Block padding="m 0">
          <Text
            text={`Asset: ${assetAddress}`}
          />
        </Block>
        {!asset && (
          <Block padding="m 0">
            <Text
              text="Initializing asset..."
            />
          </Block>
        )}
        {asset && !asset.valid && (
          <Block padding="m 0">
            <Text
              text="This asset is invalid."
              color="red"
            />
          </Block>
        )}
        {asset && asset.valid && [
          <Block key="scaling-factor" padding="m 0">
            <Text
              text={`Scaling factor: ${asset.scalingFactor}`}
            />
          </Block>,
          <Block key="balance" padding="m 0">
            <Text
              text={`Balance: ${balance}`}
            />
          </Block>,
          <Block key="balance-linked-token" padding="m 0">
            <Text
              text={`Balance of linked token: ${balanceOfLinkedToken}`}
            />
          </Block>,
          <Block key="allowance" padding="m 0">
            <Text
              text={`Account registry allowance: ${allowance}`}
            />
          </Block>,
        ]}
      </Block>
    );
  }

  render() {
    const {
      account,
    } = this.props;
    const {
      asset,
    } = this.state;

    return (
      <FlexBox>
        <div className="flex-fixed form-wrapper">
          {this.renderAssetInfo()}
        </div>
        <div className="flex-free-expand">
          {asset && asset.valid && (
            <AssetApis
              account={account}
              asset={asset}
            />
          )}
        </div>
      </FlexBox>
    );
  }
}

Asset.propTypes = {
  account: PropTypes.shape({
    address: PropTypes.string.isRequired,
  }).isRequired,
  assetAddress: PropTypes.string.isRequired,
};

export default Asset;
