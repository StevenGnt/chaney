import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';

import './Account.css';

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

  return <span className={'badge badge-' + className}>{amount}€</span>;
};

const MonthlyTransaction = props => {
  const { name, day, amount } = props.transaction;
  return <span><AmountLabel amount={amount} /> {name} every <b>{day}</b></span>;
};

/**
 * Get the name of a day from its ordinal
 * @param {number} day
 * @returns {string}
 */
function getDayName(day) {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day - 1];
}

const WeeklyTransaction = props => {
  const { name, day, amount } = props.transaction;
  return <span><AmountLabel amount={amount} /> {name} every <b>{getDayName(day)}</b></span>;
};

const UniqueTransaction = props => {
  const { name, date, amount } = props.transaction;
  return <span><AmountLabel amount={amount} /> {name} on <b>{date}</b></span>;
};

class Account extends React.Component {
  render() {
    const { transactions } = this.props.account;

    const parts = [
      { name: 'Monthly', key: 'monthly', renderer: MonthlyTransaction },
      { name: 'Weekly', key: 'weekly', renderer: WeeklyTransaction },
      { name: 'Unique', key: 'unique', renderer: UniqueTransaction },
    ];

    const renderedParts = parts.map(({ key, name, renderer: Renderer }) => {
      const renderedTransactions = key in transactions && transactions[key].length > 0
        ? (
          <ul>
            {transactions[key].map((transaction, i) => <li key={i}><Renderer transaction={transaction} /></li>)}
          </ul>
        )
        : (<span className="no-transaction">Nothing</span>);

      return (
        <div className="account-transactions-list" key={key}>
          <h4>{name}</h4>
          {renderedTransactions}
        </div>
      );
    });

    return (
      <div className="account-details">
        <h3><FontAwesome name="book" /> {this.props.account.name}</h3>
        <div className="account-transactions">{renderedParts}</div>
      </div>
    );
  }
}

Account.propTypes = {
  account: PropTypes.object
};

export default Account;
