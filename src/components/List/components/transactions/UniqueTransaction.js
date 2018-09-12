import React from 'react';
import PropTypes from 'prop-types';

import AmountLabel from '../../../AmountLabel/AmountLabel.component';

const UniqueTransaction = props => {
  const { transaction, account } = props;
  const { name, date, amount } = transaction;

  const className = date < account.date ? 'unique-passed' : '';

  return <span className={className}><AmountLabel amount={amount} /> {name} on <b>{date}</b></span>;
};

UniqueTransaction.propTypes = {
  name: PropTypes.string,
  day: PropTypes.string,
  amount: PropTypes.number,
};

export default UniqueTransaction;
