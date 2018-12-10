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
    const { account } = this.props;
    const { transactions } = account;

    const unit = account.unit || '€';

    const renderedParts = transactionTypes.map(({ key, name, sort, renderer: Renderer }) => {
      const partTransaction = key in transactions
        ? transactions[key].concat()
        : [];

      if (sort) {
        partTransaction.sort(sort);
      }

      return (
        <div className="account-transactions-list" key={key}>
          <h4>{name}</h4>
          {partTransaction.length > 0
            ? (
              <ul>
                {partTransaction.map(
                  (transaction, i) => <li key={i}><Renderer transaction={transaction} account={account} unit={unit} /></li>
                )}
              </ul>
            )
            : <span className="no-transaction">Nothing</span>}
        </div>
      );
    });

    // Build monthly badge
    const sumMonthly = (transactions.monthly || []).reduce((acc, transaction) => acc + transaction.amount, 0);
    const sumWeekly = (transactions.weekly || []).reduce((acc, transaction) => acc + transaction.amount, 0);
    const monthlyBalance = sumMonthly + 4 * sumWeekly;

    let sign = '';
    let badgeClass = 'badge ';
    if (monthlyBalance > 0) {
      badgeClass += 'badge-success';
      sign = '+';
    } else if (monthlyBalance < 0) {
      badgeClass += 'badge-danger';
      sign = '';
    } else {
      badgeClass += 'badge-secondary';
      sign = '';
    }

    // Account balance
    let balance;
    if (account.showMonthlyBalance) {
      const balanceLabel = `${sign}${monthlyBalance}${unit}`;
      balance = (<span title={`Per month balance : ${balanceLabel}`} className={badgeClass}> {balanceLabel}</span>);
    }

    return (
      <div className="account-details">
        <h3><FontAwesome name="book" /> {this.props.account.name}{balance}</h3>
        <div className="account-transactions">{renderedParts}</div>
      </div>
    );
  }
}

Account.propTypes = {
  account: PropTypes.object
};

export default Account;
