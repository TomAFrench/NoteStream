import React, {useState, useEffect} from 'react';
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

const daysOption = [...Array(366).keys()];
const hoursOption = [...Array(24).keys()];
const minutesOption = [...Array(60).keys()];

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export default function CreateStreamDialog({aztec, zkAssets, userAddress, streamContractInstance}) {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false);
  const [zkAsset, setZkAsset] = useState();
  const [privateBalance, setPrivateBalance] = useState(0);
  const [streamAmount, setStreamAmount] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  async function depositZkToken(depositAmount) {
    await zkAsset.deposit([
      { to: userAddress, amount: parseInt(depositAmount, 10) },
    ]);
    handleClose()
  }

  const updateZkAsset = async (address) => {
    const zkAsset = await aztec.zkAsset(address)
    setZkAsset(zkAsset)

    const privateBalance = await zkAsset.balance(userAddress)
    setPrivateBalance(privateBalance)
  }
  
  useEffect(()=> {
    if (aztec.zkAsset && Object.keys(zkAssets).length){
      updateZkAsset(Object.keys(zkAssets)[0])}
    },
    [aztec.zkAsset, zkAssets]
  )

  function initialiseStream(
    payeeAddress,
    noteForStreamContract,
    startTime,
    endTime,
  ) {
    return streamContractInstance.methods
      .createStream(
        payeeAddress,
        noteForStreamContract.noteHash,
        zkAsset.address,
        startTime,
        endTime,
      )
      .send({ from: userAddress }, (err, streamID) => {
        if (err) {
          console.log(err);
          return null;
        }
        console.log('Steam ID', streamID);
        return streamID;
      });
  }

  async function fundStream(
    streamContractAddress,
    payeeAddress,
    sendAmount,
    asset,
  ) {
    const { outputNotes } = await asset.send(
      [
        {
          to: streamContractAddress,
          amount: sendAmount,
          aztecAccountNotRequired: true,
          numberOfOutputNotes: 1, // contract has one
        },
      ],
      { userAccess: [userAddress, payeeAddress] }, // Give view access to sender and recipient
    );
    const noteForStreamContract = outputNotes[0]
    console.log('noteForStreamContract', noteForStreamContract);
    return noteForStreamContract;
  }

  async function createStream(sendAmount, payeeAddress, startTime, endTime) {
    const streamNote = await fundStream(
      streamContractInstance.options.address,
      payeeAddress,
      sendAmount,
      zkAsset,
    );
    return initialiseStream(
      payeeAddress,
      streamNote,
      startTime,
      endTime,
    );
  }

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
              <TextField
                label="Recipient"
                placeholder="0x...."
                variant="outlined"
                value={recipient}
                onChange={val => setRecipient(val.target.value)}
                fullWidth
                flexGrow={1}
              />
            </Grid>
            <DialogContentText>
              Enter the value of the stream: (Note: this value isn't published onchain publicly, only in the form of an encrypted AZTEC note.)
            </DialogContentText>
            <DialogContentText>
              {`Your private balance: ${privateBalance} ${zkAsset && zkAssets[zkAsset.address].symbol}`}
            </DialogContentText>
            <Grid item xs={12}>
              <TextField
                select
                label="zkAsset"
                value={zkAsset ? zkAsset.address : undefined}
                onChange={val => updateZkAsset(val.target.value)}
                SelectProps={{
                  native: true,
                }}
                variant="filled"
                fullWidth
                // className={classes.formControl}
              >
                {Object.entries(zkAssets).map(([address, metadata]) => (
                    <option key={address} value={address}>
                      {metadata.symbol}
                    </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Stream value"
                placeholder=""
                variant="outlined"
                value={streamAmount}
                onChange={val => setStreamAmount(val.target.value)}
                fullWidth
                flexGrow={1}
              />
            </Grid>
            <DialogContentText>
              Enter the duration of the stream:
            </DialogContentText>
            <Grid item container
                direction="row"
                justify="center"
                alignContent="stretch"
                spacing={2}
                xs={12}>
                <Grid item>
                  <TextField
                    select
                    label="Days"
                    value={days}
                    onChange={val => setDays(val.target.value)}
                    SelectProps={{
                      native: true,
                    }}
                    variant="filled"
                    fullWidth
                    className={classes.formControl}
                  >
                    {daysOption.map(option => (
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
                    onChange={val => setHours(val.target.value)}
                    SelectProps={{
                      native: true,
                    }}
                    variant="filled"
                    fullWidth
                    className={classes.formControl}
                  >
                    {hoursOption.map(option => (
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
                    onChange={val => setMinutes(val.target.value)}
                    SelectProps={{
                      native: true,
                    }}
                    variant="filled"
                    fullWidth
                    className={classes.formControl}
                  >
                    {minutesOption.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            <DialogContentText>
              After you click "Create Stream", you will be asked to sign two transactions. The first sends the AZTEC note to the NoteStream contract and the second creates the stream.
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
          <Button onClick={async () => {
            await createStream(
                  streamAmount,
                  recipient,
                  parseInt(
                    moment()
                      .add(5, 'minutes')
                      .format('X'),
                    10,
                  ),
                  parseInt(
                    moment()
                      .add(days, 'days')
                      .add(hours, 'hours')
                      .add(minutes + 5, 'minutes')
                      .format('X'),
                    10,
                  ),
                )
              handleClose()
            }}
              color="primary">
            Create Stream
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
