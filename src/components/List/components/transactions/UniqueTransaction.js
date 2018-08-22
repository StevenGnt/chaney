import React from 'react';

import AmountLabel from './AmountLabel';

export default props => {
  const { name, date, amount } = props.transaction;
  return <span><AmountLabel amount={amount} /> {name} on <b>{date}</b></span>;
};
