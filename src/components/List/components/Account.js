import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';

import WeeklyTransaction from './transactions/WeeklyTransaction';
import MonthlyTransaction from './transactions/MonthlyTransaction';
import UniqueTransaction from './transactions/UniqueTransaction';

import './Account.css';

const transactionTypes = [
  { key: 'monthly', name: 'Monthly', renderer: MonthlyTransaction },
  { key: 'weekly', name: 'Weekly', renderer: WeeklyTransaction },
  { key: 'unique', name: 'Unique', renderer: UniqueTransaction },
];

class Account extends React.Component {
  render() {
    const { transactions } = this.props.account;

    const renderedParts = transactionTypes.map(({ key, name, renderer: Renderer }) => {
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
