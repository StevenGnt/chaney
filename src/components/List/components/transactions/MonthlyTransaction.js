import React from 'react';
import AmountLabel from './AmountLabel';

function formatMonthlyDay(day) {
  return (Array.isArray(day) ? day : [day]).join(', ');
}

export default props => {
  const { name, day, amount } = props.transaction;
  return <span><AmountLabel amount={amount} /> {name} every <b>{formatMonthlyDay(day)}</b></span>;
};
