import React, { ReactElement, useCallback, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';

import moment from 'moment';
import createStream from '../../utils/streamCreation';

import AddressInput from '../form/AddressInput';
import ZkAssetSelect from '../form/ZkAssetSelect';
import { Address } from '../../types/types';

const daysOption = [...Array(366).keys()];
const hoursOption = [...Array(24).keys()];
const minutesOption = [...Array(60).keys()];

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export default function CreateStreamDialog({
  aztec,
  zkAssets,
  userAddress,
  streamContractInstance,
}: {
  aztec: any;
  zkAssets: Array<any>;
  userAddress: Address;
  streamContractInstance: any;
}): ReactElement {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [zkAsset, setZkAsset] = useState({} as any);
  const [privateBalance, setPrivateBalance] = useState(0);
  const [streamAmount, setStreamAmount] = useState<string>('');
  const [recipient, setRecipient] = useState('');
  const [days, setDays] = useState<string>('0');
  const [hours, setHours] = useState<string>('0');
  const [minutes, setMinutes] = useState<string>('0');

  const handleClickOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const updateZkAsset = useCallback(
    async (address: Address): Promise<void> => {
      const newZkAsset = await aztec.zkAsset(address);
      setZkAsset(newZkAsset);

      const newPrivateBalance = await newZkAsset.balance(userAddress);
      setPrivateBalance(newPrivateBalance);
    },
    [aztec, userAddress],
  );

  useEffect(() => {
    if (aztec.zkAsset && Object.keys(zkAssets).length) {
      updateZkAsset(Object.keys(zkAssets)[0]);
    }
  }, [aztec.zkAsset, zkAssets, updateZkAsset]);

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        2. Create a new stream
      </Button>
      <Dialog open={open} onClose={handleClose} scroll="body">
        <DialogTitle id="form-dialog-title">Create Stream</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the address of who you want to stream to:
          </DialogContentText>
          <Grid container direction="column" spacing={3}>
            <Grid item xs={12}>
              <AddressInput
                label="Recipient"
                placeholder="0x...."
                variant="outlined"
                address={recipient}
                setAddress={setRecipient}
                aztec={aztec}
                fullWidth
              />
            </Grid>
            <DialogContentText>
              Enter the value of the stream: (Note: this value isn&apos;t
              published on-chain publicly, only in the form on an encrypted
              AZTEC note.)
            </DialogContentText>
            <DialogContentText>
              {`Your private balance: ${privateBalance} ${
                zkAsset.address && zkAssets[zkAsset.address].symbol
              }`}
            </DialogContentText>
            <Grid item xs={12}>
              <ZkAssetSelect
                currentAsset={zkAsset}
                updateAsset={updateZkAsset}
                assetList={zkAssets}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Stream value"
                placeholder=""
                variant="outlined"
                value={streamAmount}
                onChange={(val): void => setStreamAmount(val.target.value)}
                fullWidth
              />
            </Grid>
            <DialogContentText>
              Enter the duration of the stream:
            </DialogContentText>
            <Grid
              item
              container
              direction="row"
              justify="center"
              alignContent="stretch"
              spacing={2}
              xs={12}
            >
              <Grid item>
                <TextField
                  select
                  label="Days"
                  value={days}
                  onChange={(val): void => setDays(val.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  variant="filled"
                  fullWidth
                  className={classes.formControl}
                >
                  {daysOption.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item>
                <TextField
                  select
                  label="Hours"
                  value={hours}
                  onChange={(val): void => setHours(val.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  variant="filled"
                  fullWidth
                  className={classes.formControl}
                >
                  {hoursOption.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item>
                <TextField
                  select
                  label="Minutes"
                  value={minutes}
                  onChange={(val): void => setMinutes(val.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  variant="filled"
                  fullWidth
                  className={classes.formControl}
                >
                  {minutesOption.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <DialogContentText>
              After you click &quot;Create Stream&quot;, you will be asked to
              sign two transactions. The first sends the AZTEC note to the
              NoteStream contract and the second creates the stream.
            </DialogContentText>
            <DialogContentText>
              In a later update, these two transactions will be combined.
            </DialogContentText>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={async (): Promise<void> => {
              await createStream(
                parseInt(streamAmount, 10),
                streamContractInstance,
                userAddress,
                recipient,
                zkAsset,
                parseInt(moment().add(5, 'minutes').format('X'), 10),
                parseInt(
                  moment()
                    .add(days, 'days')
                    .add(hours, 'hours')
                    .add(minutes + 5, 'minutes')
                    .format('X'),
                  10,
                ),
              );
              handleClose();
            }}
            color="primary"
          >
            Create Stream
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
