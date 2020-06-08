import React, { useState, useEffect, ReactElement, useMemo } from 'react';
import PropTypes from 'prop-types';

import LinearProgress from '@material-ui/core/LinearProgress';

import moment from 'moment';

import calculateTime from '../../utils/time';

const DoubleProgressBar = ({
  startTime,
  stopTime,
  lastWithdrawTime,
}: {
  startTime: number;
  stopTime: number;
  lastWithdrawTime: number;
}): ReactElement | null => {
  const [timePercentage, setTimePercentage] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTimePercentage = calculateTime(
        moment.unix(startTime),
        moment.unix(stopTime),
      );
      setTimePercentage(parseFloat(newTimePercentage.toFixed(2)));
    }, 1000);
    return (): void => {
      clearInterval(intervalId);
    };
  }, [startTime, stopTime]);

  const withdrawPercentage = useMemo(
    () =>
      calculateTime(
        moment.unix(startTime),
        moment.unix(stopTime),
        moment.unix(lastWithdrawTime),
      ),
    [startTime, stopTime, lastWithdrawTime],
  );

  return (
    <>
      <LinearProgress variant="determinate" value={timePercentage} />
      <LinearProgress
        variant="determinate"
        value={withdrawPercentage}
        color="secondary"
      />
    </>
  );
};

DoubleProgressBar.propTypes = {
  startTime: PropTypes.number.isRequired,
  stopTime: PropTypes.number.isRequired,
  lastWithdrawTime: PropTypes.number.isRequired,
};

export default DoubleProgressBar;
