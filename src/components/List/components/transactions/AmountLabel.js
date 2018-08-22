import React from 'react';

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

  return <span className={'badge badge-' + className}>{amount}€</span>;
};
