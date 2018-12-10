import React from 'react';
import PropTypes from 'prop-types';

import './AmountLabel.css';

const AmountLabel = props => {
  const { amount, unit } = props;

  let className;

  if (amount === 0) {
    className = 'info';
  } else if (amount > 0) {
    className = 'success';
  } else {
    className = 'danger';
  }

  return <span className={'amount-label badge badge-' + className}>{amount}{unit}</span>;
};

AmountLabel.propTypes = {
  amount: PropTypes.number,
  unit: PropTypes.string,
};

AmountLabel.defaultProps = {
  unit: '€',
};

export default AmountLabel;
