import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import isExternal from '../utils/links';

const flexLink = (props: any): ReactElement => {
  return isExternal(props.to) ? (
    <a href={props.to} {...props}>
      {props.children}
    </a>
  ) : (
    <Link {...props}>{props.children}</Link>
  );
};

export default flexLink;
