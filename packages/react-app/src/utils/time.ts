/*
 * Calculates the fraction of time through an interval the current time is.
 */
const calculateTime = (startTime: number, endTime: number, testTime: any = Date.now()): number => {
  if (startTime > testTime) {
    return 0;
  }
  if (endTime < testTime) {
    return 100;
  }
  return 100 * ((testTime - startTime) / (endTime - startTime));
};

export default calculateTime;
