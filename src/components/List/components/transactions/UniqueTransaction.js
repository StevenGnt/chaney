import React from 'react';
import PropTypes from 'prop-types';

import AmountLabel from '../../../AmountLabel/AmountLabel.component';
import TransactionText from '../../../TransactionText/TransactionText.component';

const UniqueTransaction = props => {
  const { transaction, account, unit } = props;
  const { date, amount } = transaction;

  const className = date < account.date ? 'unique-passed' : '';

  return <span className={className}><AmountLabel amount={amount} unit={unit} /> <TransactionText transaction={transaction} /> on <b>{date}</b></span>;
};

UniqueTransaction.propTypes = {
  transaction: PropTypes.shape({
    name: PropTypes.string,
    date: PropTypes.string,
    amount: PropTypes.number,
  }),
  unit: PropTypes.string,
  account: PropTypes.object,
};

export default UniqueTransaction;
