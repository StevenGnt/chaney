import React from 'react';

import './AmountLabel.css';

export default props => {
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
