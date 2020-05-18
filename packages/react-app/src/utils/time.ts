import moment, { Moment } from 'moment';

/*
 * Calculates the fraction of time through an interval the current time is.
 */
const calculateTime = (
  startTime: Moment,
  endTime: Moment,
  testTime: Moment = moment(),
): number => {
  if (startTime.isAfter(testTime)) {
    return 0;
  }
  if (endTime.isBefore(testTime)) {
    return 100;
  }

  const elapsedTime = moment
    .duration(testTime.diff(startTime))
    .asMilliseconds();
  const streamDuration = moment
    .duration(endTime.diff(startTime))
    .asMilliseconds();
  const percentageElapsed = 100 * (elapsedTime / streamDuration);
  return percentageElapsed;
};

export default calculateTime;
