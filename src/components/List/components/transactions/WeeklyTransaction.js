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
  const { transaction, unit } = props;
  const { name, day, amount } = transaction;

  return <span><AmountLabel amount={amount} unit={unit} /> {name} every <b>{formatWeeklyDay(day)}</b></span>;
};


WeeklyTransaction.propTypes = {
  transaction: PropTypes.shape({
    name: PropTypes.string,
    // day: PropTypes.arrayOf(PropTypes.number),
    day: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.number), PropTypes.number]),
    amount: PropTypes.number,
  }),
  unit: PropTypes.string,
};

export default WeeklyTransaction;
