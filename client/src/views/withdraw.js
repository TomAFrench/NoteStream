async function buildProofs() {
  // if currentBalance is 0 we have to change this as the ratio is infinite

  if (!web3){
    return false
  }

  const streamContractInstance = new web3.eth.Contract(
    streamContract.abi,
    streamContractInstance.address
  );

  const events = await streamContractInstance.getPastEvents("allEvents", {filter: {recipient: userAddress}})
  console.log(events)
  const streamId = _.last(events) && _.last(events).returnValues.streamId;

  const streamObj = await streamContractInstance.methods.getStream(streamId).call()

  const {proofData: proofData1, inputNotes, outputNotes} = buildDividendProof(aztec, streamObj)
  const {proofData: proofData2, outputNotes: [withdrawPaymentNote, changeNote] } = buildJoinSplitProof(aztec, streamObj, inputNotes[0], outputNotes[0], streamContractInstance.address)

  return {
    proofs: [proofData1, proofData2],
    notes: {
      changeNote,
      withdrawPaymentNote,
    },
  };
}

async function buildDividendProof(aztec, stream) {
  const {sender, recipient, currentBalance, lastWithdrawTime, endTime } = stream

  const payer = await aztec.user(sender)
  const payee = await aztec.user(recipient)

  const ratio1 = getFraction((Date.now() - lastWithdrawTime) / (endTime - lastWithdrawTime) * 10000);
      
  const streamNote = aztec.zkNote(currentBalance)
  const withdrawPayment = computeRemainderNoteValue(streamNote.k.toNumber(), ratio1.denominator, ratio1.numerator);
  const remainderNote2 = await aztec.note.create(payer.spendingPublicKey, withdrawPayment.remainder, [{address: payer.address, linkedPublicKey: payer.linkedPublicKey}]);
  const withdrawPaymentNote = await aztec.note.create(payee.spendingPublicKey, withdrawPayment.expectedNoteValue, [{address: payee.address, linkedPublicKey: payee.linkedPublicKey}]);

  const { proofData } = aztec.proof.dividendComputation.encodeDividendComputationTransaction({
    inputNotes: [streamNote],
    outputNotes: [withdrawPaymentNote, remainderNote2],
    za: ratio1.numerator,
    zb: ratio1.denominator,
    senderAddress: streamContractInstance.address,
  });

  return {proofData, inputNotes: [streamNote], outputNotes: [withdrawPaymentNote, remainderNote2]}
}

async function buildJoinSplitProof(aztec, stream, streamNote, withdrawPaymentNote) {
  const {sender, recipient} = stream

  const payer = await aztec.user(sender)
  const payee = await aztec.user(recipient)
  const changeValue = Math.max(streamNote.k.toNumber() - withdrawPaymentNote.k.toNumber(), 0)

  const changeNote = await aztec.note.create(
    payer.spendingPublicKey,
    changeValue,
    [{address: payer.address, linkedPublicKey: payer.linkedPublicKey},
     {address: payee.address, linkedPublicKey: payee.linkedPublicKey}],
     streamContractInstance.address
  );

  const { proofData } = aztec.proof.joinSplit.encodeJoinSplitTransaction({
    inputNotes: [streamNote],
    outputNotes: [withdrawPaymentNote, changeNote],
    inputNoteOwners: [],
    senderAddress: streamContractInstance.address,
    publicOwner: recipient,
    kPublic: 0, // No transfer from private to public assets or vice versa
  });

  return {proofData, inputNotes: [streamNote], outputNotes: [withdrawPaymentNote, changeNote]}
}