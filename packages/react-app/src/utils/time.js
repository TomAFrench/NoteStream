
/*
 * Calculates the fraction of time through an interval the current time is.  
 */
export const calculateTime = (startTime, endTime, testTime = Date.now() ) => {
  if (startTime > testTime) {
    return 0;
  } else if (endTime < testTime) {
    return 100;
  } else {
    return 100 * (testTime - startTime) / (endTime - startTime);
  }
};
