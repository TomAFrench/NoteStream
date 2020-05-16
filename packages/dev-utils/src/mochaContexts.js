/* eslint-disable func-names */
const { bigNumberify } = require('ethers/utils');
const moment = require('moment');
const traveler = require('ether-time-traveler');

const devConstants = require('./constants');

const { STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = devConstants;

function contextForSpecificTime(
  contextText,
  timeDuration,
  provider,
  functions,
) {
  const now = bigNumberify(moment().format('X'));

  describe(contextText, function () {
    beforeEach(async function () {
      await traveler.advanceBlockAndSetTime(
        provider,
        now.add(timeDuration.toString()).toNumber(),
      );
    });

    functions();

    afterEach(async function () {
      await traveler.advanceBlockAndSetTime(provider, now.toNumber());
    });
  });
}

function contextForStreamDidStartButNotEnd(provider, functions) {
  const timeDuration = STANDARD_TIME_OFFSET.plus(5);
  contextForSpecificTime(
    'when the stream did start but not end',
    timeDuration,
    provider,
    functions,
  );
}

function contextForStreamDidEnd(provider, functions) {
  const timeDuration = STANDARD_TIME_OFFSET.plus(STANDARD_TIME_DELTA).plus(5);
  contextForSpecificTime(
    'when the stream did end',
    timeDuration,
    provider,
    functions,
  );
}

module.exports = {
  contextForStreamDidStartButNotEnd,
  contextForStreamDidEnd,
};
