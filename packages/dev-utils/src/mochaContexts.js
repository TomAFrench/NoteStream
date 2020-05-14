/* eslint-disable func-names */
const BigNumber = require('bignumber.js');
const moment = require('moment');
const traveler = require('ganache-time-traveler');

const devConstants = require('./constants');

const { STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = devConstants;

function contextForStreamDidStartButNotEnd(functions) {
    const now = new BigNumber(moment().format('X'));

    describe('when the stream did start but not end', () => {
        beforeEach(async () => {
            await traveler.advanceBlockAndSetTime(
                now.plus(STANDARD_TIME_OFFSET).plus(5).toNumber()
            );
        });

        functions();

        afterEach(async () => {
            await traveler.advanceBlockAndSetTime(now.toNumber());
        });
    });
}

function contextForStreamDidEnd(functions) {
    const now = new BigNumber(moment().format('X'));

    describe('when the stream did end', () => {
        beforeEach(async () => {
            await traveler.advanceBlockAndSetTime(
                now
                    .plus(STANDARD_TIME_OFFSET)
                    .plus(STANDARD_TIME_DELTA)
                    .plus(5)
                    .toNumber()
            );
        });

        functions();

        afterEach(async () => {
            await traveler.advanceBlockAndSetTime(now.toNumber());
        });
    });
}

module.exports = {
    contextForStreamDidStartButNotEnd,
    contextForStreamDidEnd,
};
