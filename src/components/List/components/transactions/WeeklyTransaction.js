import React from 'react';
import AmountLabel from './AmountLabel';

const daysNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatWeeklyDay(day) {
  return (Array.isArray(day) ? day : [day])
    .map(day => daysNames[day - 1])
    .join(', ');
}

export default props => {
  const { name, day, amount } = props.transaction;
  return <span><AmountLabel amount={amount} /> {name} every <b>{formatWeeklyDay(day)}</b></span>;
};
