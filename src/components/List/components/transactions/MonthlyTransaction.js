import React from 'react';
import PropTypes from 'prop-types';

import AmountLabel from '../../../AmountLabel/AmountLabel.component';
import { getTransactionDays } from '../Account.utils';

function formatMonthlyDay(day) {
  return getTransactionDays(day).join(', ');
}

const MonthlyTransaction = props => {
  const { name, day, amount } = props.transaction;
  return <span><AmountLabel amount={amount} /> {name} every <b>{formatMonthlyDay(day)}</b></span>;
};

MonthlyTransaction.propTypes = {
  name: PropTypes.string,
  day: PropTypes.string,
  amount: PropTypes.number,
};

export default MonthlyTransaction;
