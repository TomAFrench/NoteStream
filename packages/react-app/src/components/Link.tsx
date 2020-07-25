import React, { ReactElement } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import isExternal from '../utils/links';

interface Props {
  to: string;
  children: any;
  [x: string]: any;
}

const FlexLink = ({ to, children, ...rest }: Props): ReactElement =>
  isExternal(to) ? (
    <a href={to} {...rest}>
      {children}
    </a>
  ) : (
    <Link to={to} {...rest}>
      {children}
    </Link>
  );

FlexLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default FlexLink;
