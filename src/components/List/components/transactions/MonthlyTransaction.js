import React from 'react';
import PropTypes from 'prop-types';

import AmountLabel from '../../../AmountLabel/AmountLabel.component';
import { getTransactionDays } from '../Account.utils';

function formatMonthlyDay(day) {
  return getTransactionDays(day).join(', ');
}

const MonthlyTransaction = props => {
  const { transaction, unit } = props;
  const { name, day, amount, start, end } = transaction;

  let transactionDateBracket = '';

  if (start && end) {
    transactionDateBracket = `From ${start} to ${end}`;
  } else if (start) {
    transactionDateBracket = `Starting ${start}`;
  } else if (end) {
    transactionDateBracket = `Until ${end}`;
  }


  return (
    <span className={transactionDateBracket && 'monthly-transaction-date-bracket'} title={transactionDateBracket}>
      <AmountLabel amount={amount} unit={unit} /> {name} every <b>{formatMonthlyDay(day)}</b>
    </span>
  );
};

MonthlyTransaction.propTypes = {
  transaction: PropTypes.shape({
    name: PropTypes.string,
    day: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.number), PropTypes.number]),
    amount: PropTypes.number,
  }),
  unit: PropTypes.string,
};

export default MonthlyTransaction;
