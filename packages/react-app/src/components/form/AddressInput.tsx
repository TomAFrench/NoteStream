import React, { ReactElement, useState, useEffect } from 'react';
import { getAddress } from '@ethersproject/address';

import TextField from '@material-ui/core/TextField';
import { Address, AztecSDK } from '../../types/types';

const AddressInput = (props: any): ReactElement => {
  const {
    address,
    setAddress,
    aztec,
  }: {
    address: Address;
    setAddress: Function;
    aztec: AztecSDK;
  } = props;

  const [invalidAddress, setInvalidAddress] = useState<boolean>(false);

  useEffect(() => {
    const checkAddressIsValid = async (testAddress: Address): Promise<void> => {
      try {
        if (getAddress(testAddress)) {
          const user = await aztec.user(testAddress);
          setInvalidAddress(!user.registered);
        }
      } catch (e) {
        // Don't show error state if user is still typing
        setInvalidAddress(false);
      }
    };

    checkAddressIsValid(address);
  }, [aztec, address]);

  return (
    <TextField
      value={address}
      onChange={(val): void => {
        setAddress(val.target.value);
      }}
      {...props}
      error={invalidAddress}
      helperText={invalidAddress && 'Recipient does not have an Aztec account'}
    />
  );
};

export default AddressInput;
