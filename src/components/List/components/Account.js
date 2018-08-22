import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';

import WeeklyTransaction from './transactions/WeeklyTransaction';
import MonthlyTransaction from './transactions/MonthlyTransaction';
import UniqueTransaction from './transactions/UniqueTransaction';

import { sortDaily, sortMultipleDays } from './Account.utils';
import './Account.css';

const transactionTypes = [
  { key: 'monthly', name: 'Monthly', renderer: MonthlyTransaction, sort: sortMultipleDays },
  { key: 'weekly', name: 'Weekly', renderer: WeeklyTransaction, sort: sortMultipleDays },
  { key: 'unique', name: 'Unique', renderer: UniqueTransaction, sort: sortDaily },
];

class Account extends React.Component {
  render() {
    const { transactions } = this.props.account;

    const renderedParts = transactionTypes.map(({ key, name, sort, renderer: Renderer }) => {
      const partTransaction = key in transactions
        ? transactions[key].concat()
        : [];

      if (sort) {
        console.log('[SG]', 'sorting because has sort', name);
        partTransaction.sort(sort);
      }

      return (
        <div className="account-transactions-list" key={key}>
          <h4>{name}</h4>
          {partTransaction.length > 0
            ? (
              <ul>
                {partTransaction.map((transaction, i) => <li key={i}><Renderer transaction={transaction} /></li>)}
              </ul>
            )
            : <span className="no-transaction">Nothing</span>}
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
