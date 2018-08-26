import React from 'react';
import PropTypes from 'prop-types';

import './AmountLabel.css';

const AmountLabel = props => {
  const { amount } = props;

  let className;

  if (amount === 0) {
    className = 'info';
  } else if (amount > 0) {
    className = 'success';
  } else {
    className = 'danger';
  }

  return <span className={'amount-label badge badge-' + className}>{amount}€</span>;
};

AmountLabel.propTypes = {
  amount: PropTypes.number,
};

export default AmountLabel;
