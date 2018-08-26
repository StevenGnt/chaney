import React from 'react';
import PropTypes from 'prop-types';

import AmountLabel from '../../../AmountLabel/AmountLabel.component';

const daysNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatWeeklyDay(day) {
  return (Array.isArray(day) ? day : [day])
    .map(day => daysNames[day - 1])
    .join(', ');
}

const WeeklyTransaction = props => {
  const { name, day, amount } = props.transaction;
  return <span><AmountLabel amount={amount} /> {name} every <b>{formatWeeklyDay(day)}</b></span>;
};



WeeklyTransaction.propTypes = {
  name: PropTypes.string,
  day: PropTypes.string,
  amount: PropTypes.number,
};

export default WeeklyTransaction;
