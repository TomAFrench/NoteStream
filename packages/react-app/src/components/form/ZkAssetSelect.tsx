import React, { ReactElement } from 'react';

import TextField from '@material-ui/core/TextField';

const ZkAssetSelect = ({
  currentAsset,
  updateAsset,
  assetList,
}: {
  currentAsset: any;
  updateAsset: Function;
  assetList: object;
}): ReactElement => {
  return (
    <TextField
      select
      label="zkAsset"
      value={currentAsset ? currentAsset.address : undefined}
      onChange={(val): Promise<void> => updateAsset(val.target.value)}
      SelectProps={{
        native: true,
      }}
      variant="filled"
      fullWidth
      // className={classes.formControl}
    >
      {Object.entries(assetList).map(([address, metadata]: [any, any]) => (
        <option key={address} value={address}>
          {metadata.symbol}
        </option>
      ))}
    </TextField>
  );
};

export default ZkAssetSelect;
