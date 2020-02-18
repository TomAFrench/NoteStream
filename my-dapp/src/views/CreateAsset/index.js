import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ERC20Mintable from '@aztec/contract-artifacts/artifacts/ERC20Mintable';
import ZkAsset from '@aztec/contract-artifacts/artifacts/ZkAssetOwnable';
import {
  Block,
  Text,
  TextButton,
  Button,
} from '@aztec/guacamole-ui';
import isValidAddress from '../../utils/isValidAddress';
import Input from '../../components/Input';

class CreateAsset extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      creating: false,
      zkAssetAddress: '',
      erc20Address: '',
      customERC20Address: '',
      initialAmount: 1000,
      mintedAmount: 0,
      scalingFactor: 1,
      erc20AddressError: '',
      scalingFactorError: '',
      error: null,
    };
  }

  handleChangeERC20Address = (customERC20Address) => {
    this.setState({
      customERC20Address,
      erc20AddressError: '',
    });
  };

  handleChangeInitialAmount = (initialAmount) => {
    this.setState({
      initialAmount,
    });
  };

  handleChangeScalingFactor = (scalingFactor) => {
    this.setState({
      scalingFactor,
      scalingFactorError: '',
    });
  };

  handleCreateNewAsset = () => {
    const {
      erc20Address,
      customERC20Address,
      scalingFactor,
    } = this.state;

    let erc20AddressError = '';
    let scalingFactorError = '';
    if (customERC20Address && !isValidAddress(customERC20Address)) {
      erc20AddressError = 'Invalid ERC20 address.';
    }
    if (!scalingFactor) {
      scalingFactorError = "Scaling factor can't be empty.";
    }
    if (erc20AddressError || scalingFactorError) {
      this.setState({
        erc20AddressError,
        scalingFactorError,
      });
      return;
    }

    const nextStep = erc20Address || customERC20Address
      ? this.deployZkAsset
      : this.deployERC20;

    this.setState(
      {
        creating: true,
        zkAssetAddress: '',
        erc20Address: '',
        mintedAmount: 0,
        error: null,
      },
      nextStep,
    );
  };

  async deployERC20() {
    let deployedERC20;
    try {
      deployedERC20 = await window.aztec.web3.deploy(ERC20Mintable);
    } catch (error) {
      this.setState({
        creating: false,
        error,
      });
      return;
    }

    this.setState(
      {
        erc20Address: deployedERC20.address,
      },
      this.deployZkAsset,
    );
  }

  async deployZkAsset() {
    const {
      erc20Address,
      customERC20Address,
      scalingFactor,
      initialAmount,
    } = this.state;

    const aceAddress = window.aztec.web3.getAddress('ACE');
    let deployedZkAsset;
    try {
      deployedZkAsset = await window.aztec.web3.deploy(
        ZkAsset,
        [
          aceAddress,
          customERC20Address || erc20Address,
          scalingFactor,
        ],
      );
    } catch (error) {
      this.setState({
        creating: false,
        error,
      });
      return;
    }

    const nextStep = initialAmount && initialAmount !== '0'
      ? this.mintInitialBalance
      : this.handleAssetCreated;

    this.setState(
      {
        zkAssetAddress: deployedZkAsset.address,
      },
      nextStep,
    );
  }

  async mintInitialBalance() {
    const {
      account,
    } = this.props;
    const {
      initialAmount,
      erc20Address,
      customERC20Address,
    } = this.state;

    try {
      await window.aztec.web3
        .useContract('ERC20')
        .at(customERC20Address || erc20Address)
        .method('mint')
        .send(
          account.address,
          initialAmount,
        );
    } catch (error) {
      this.setState({
        error,
      });
      return;
    }

    this.setState(
      {
        mintedAmount: initialAmount,
      },
      () => {
        setTimeout(() => {
          this.handleAssetCreated();
        }, 1000);
      },
    );
  }

  handleAssetCreated() {
    const {
      onCreateNewAsset,
    } = this.props;
    const {
      zkAssetAddress,
    } = this.state;

    onCreateNewAsset(zkAssetAddress);
  }

  renderForm() {
    const {
      creating,
      customERC20Address,
      initialAmount,
      scalingFactor,
      erc20AddressError,
      scalingFactorError,
    } = this.state;

    return (
      <Block
        padding="l"
        align="left"
        borderRadius="m"
        hasBorder
      >
        <Input
          label="ERC20"
          placeholder="Leave blank to create a new one"
          value={customERC20Address}
          onChange={this.handleChangeERC20Address}
          error={erc20AddressError}
        />
        <Input
          type="number"
          label="Initial Amount"
          value={initialAmount}
          onChange={this.handleChangeInitialAmount}
          maxValue="1000000000000000000000000"
        />
        <Input
          type="number"
          label="Scaling Factor"
          value={scalingFactor}
          onChange={this.handleChangeScalingFactor}
          maxValue="1000000000000000000000000"
          error={scalingFactorError}
        />
        <Block padding="m">
          <Button
            text="Create new asset"
            onSubmit={this.handleCreateNewAsset}
            isLoading={creating}
            expand
          />
        </Block>
      </Block>
    );
  }

  renderStatus() {
    const {
      creating,
      erc20Address,
      customERC20Address,
      zkAssetAddress,
      mintedAmount,
      initialAmount,
      error,
    } = this.state;

    if (!creating && !error) {
      return null;
    }

    const statusArr = [];
    let retryButton;
    if (!erc20Address && !customERC20Address) {
      statusArr.push('Deploying ERC20Mintable...');
      if (error) {
        retryButton = (
          <TextButton
            text="Retry"
            size="xs"
            onClick={() => {
              this.setState(
                {
                  creating: true,
                  error: null,
                },
                this.deployERC20,
              );
            }}
          />
        );
      }
    } else {
      if (!customERC20Address) {
        statusArr.push(`✓ ERC20 deployed - ${erc20Address}`);
      }

      if (!zkAssetAddress) {
        statusArr.push('Deploying zkAsset...');

        if (error) {
          retryButton = (
            <TextButton
              text="Retry"
              size="xs"
              onClick={() => {
                this.setState(
                  {
                    creating: true,
                    error: null,
                  },
                  this.deployZkAsset,
                );
              }}
            />
          );
        }
      } else {
        statusArr.push(`✓ zkAsset deployed - ${zkAssetAddress}`);

        if (initialAmount) {
          if (!mintedAmount) {
            statusArr.push(`Minting ERC20 with amount = ${initialAmount}...`);
          } else {
            statusArr.push(`✓ ERC20 balance = ${mintedAmount}`);
          }
        }
      }
    }

    return (
      <Block
        padding="l xl"
        align="left"
      >
        {statusArr.map((msg, i) => (
          <Block
            key={i}
            padding="m 0"
          >
            <Text
              text={msg}
              size="xs"
            />
          </Block>
        ))}
        {!!error && (
          <Block padding="l 0">
            <Text
              text={error.message}
              color="red"
              size="xxs"
            />
            {!!retryButton && (
              <Block top="m">
                {retryButton}
              </Block>
            )}
          </Block>
        )}
      </Block>
    );
  }

  render() {
    return (
      <Block padding="l">
        {this.renderForm()}
        {this.renderStatus()}
      </Block>
    );
  }
}

CreateAsset.propTypes = {
  account: PropTypes.shape({
    address: PropTypes.string.isRequired,
  }).isRequired,
  onCreateNewAsset: PropTypes.func.isRequired,
};

export default CreateAsset;
