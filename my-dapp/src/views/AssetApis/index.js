import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Accordion,
  ListItem,
} from '@aztec/guacamole-ui';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Send from './Send';
import CreateNote from './CreateNote';
import FetchNote from './FetchNote';

const apiConfig = [
  {
    title: 'Deposit',
    Component: Deposit,
  },
  {
    title: 'Withdraw',
    Component: Withdraw,
  },
  {
    title: 'Send',
    Component: Send,
  },
  {
    title: 'Create Note From Balance',
    Component: CreateNote,
  },
  {
    title: 'Fecth Note From Balance',
    Component: FetchNote,
  },
];

class AssetApis extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentApi: '',
    };
  }

  handleToggleApi(apiTitle) {
    const {
      currentApi,
    } = this.state;

    if (apiTitle === currentApi) {
      this.setState({
        currentApi: '',
      });
    } else {
      this.setState({
        currentApi: apiTitle,
      });
    }
  };

  renderTitle(apiTitle) {
    const {
      currentApi,
    } = this.state;

    return (
      <Block
        padding="s m"
        background="grey-lightest"
      >
        <ListItem
          iconName={apiTitle === currentApi ? 'expand_more' : 'chevron_right'}
          title={apiTitle}
          size="s"
        />
      </Block>
    );
  }

  render() {
    const {
      account,
      asset,
    } = this.props;
    const {
      currentApi,
    } = this.state;

    return (
      <Block align="left">
        {apiConfig.map(({
          title,
          Component,
        }) => (
          <Block
            key={title}
            padding="m 0"
          >
            <Accordion
              title={this.renderTitle(title)}
              content={(
                <Block padding="0 xl">
                  <Component
                    account={account}
                    asset={asset}
                  />
                </Block>
              )}
              isOpen={title === currentApi}
              onClick={() => this.handleToggleApi(title)}
            />
          </Block>
        ))}
      </Block>
    );
  }
}

AssetApis.propTypes = {
  account: PropTypes.shape({
    address: PropTypes.string.isRequired,
  }).isRequired,
  asset: PropTypes.object.isRequired,
};

export default AssetApis;
