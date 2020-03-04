
/*
 * Calculate the optimal fraction for the Dividend proof to minimise the remainder
 */
function getFraction(value, maxdenom) {
  const best = { numerator: 1, denominator: 1, err: Math.abs(value - 1) };
  if (!maxdenom) maxdenom = 10000;
  for (let denominator = 1; best.err > 0 && denominator <= maxdenom; denominator++) {
    const numerator = Math.round(value * denominator);
    const err = Math.abs(value - numerator / denominator);
    if (err >= best.err) continue;
    best.numerator = numerator;
    best.denominator = denominator;
    best.err = err;
  }
  return best;
}

/*
 * Calculates the values of the target and remainder notes for a given source note and ratio za:zb
 */
const computeRemainderNoteValue = (value, za, zb) => {
  const expectedNoteValue = Math.floor(value * (za / zb));
  const remainder = value * za - expectedNoteValue * zb;

  return {
    remainder,
    expectedNoteValue,
  };
};