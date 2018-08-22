import React from 'react';
import AmountLabel from './AmountLabel';
import { getTransactionDays } from '../Account.utils';

function formatMonthlyDay(day) {
  return getTransactionDays(day).join(', ');
}

export default props => {
  const { name, day, amount } = props.transaction;
  return <span><AmountLabel amount={amount} /> {name} every <b>{formatMonthlyDay(day)}</b></span>;
};
