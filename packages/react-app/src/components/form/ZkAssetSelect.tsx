import React, { ReactElement } from 'react';

import TextField from '@material-ui/core/TextField';
import {
  Address,
  zkAssetMetadata,
  ZkAsset,
  zkAssetMap,
} from '../../types/types';

const ZkAssetSelect = ({
  currentAsset,
  updateAsset,
  assetList,
}: {
  currentAsset?: ZkAsset;
  updateAsset: Function;
  assetList: zkAssetMap;
}): ReactElement => {
  return (
    <TextField
      select
      label="zkAsset"
      value={currentAsset?.address}
      onChange={(val): Promise<void> => updateAsset(val.target.value)}
      SelectProps={{
        native: true,
      }}
      variant="filled"
      fullWidth
      // className={classes.formControl}
    >
      {Object.entries(assetList).map(
        ([address, metadata]: [Address, zkAssetMetadata]) => (
          <option key={address} value={address}>
            {metadata.symbol}
          </option>
        ),
      )}
    </TextField>
  );
};

export default ZkAssetSelect;
