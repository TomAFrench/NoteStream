
/*
 * Calculates the fraction of time through an interval the current time is.  
 */
export const calculateTime = (startTime, endTime) => {
  if (startTime > Date.now()) {
    return 0;
  } else if (endTime < Date.now()) {
    return 100;
  } else {
    return 100 * (Date.now() - startTime) / (endTime - startTime);
  }
};
