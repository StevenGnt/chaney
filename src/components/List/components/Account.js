import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';

import WeeklyTransaction from './transactions/WeeklyTransaction';
import MonthlyTransaction from './transactions/MonthlyTransaction';
import UniqueTransaction from './transactions/UniqueTransaction';

import { sortDaily, sortMultipleDays } from './Account.utils';
import { addAmounts } from '../../../utils/maths';
import './Account.css';

const transactionTypes = [
  { key: 'monthly', name: 'Monthly', renderer: MonthlyTransaction, sort: sortMultipleDays },
  { key: 'weekly', name: 'Weekly', renderer: WeeklyTransaction, sort: sortMultipleDays },
  { key: 'unique', name: 'Unique', renderer: UniqueTransaction, sort: sortDaily },
];

/**
 * Compute the delta given by the sum of a list of transactions
 * @param {Array} transactions
 * @returns {number}
 */
function computeTransactionsDelta(transactions) {
  return transactions && transactions.length > 0
    ? transactions.reduce((acc, transaction) => addAmounts(acc, transaction.amount), 0)
    : 0;
}

function MonthlyBalance({ transactions, unit }) {
  // Build monthly badge
  const monthlyBalance = addAmounts(computeTransactionsDelta(transactions.monthly), 4 * computeTransactionsDelta(transactions.weekly));

  let sign = '';
  let badgeClass = 'badge ';
  if (monthlyBalance > 0) {
    badgeClass += 'badge-success';
    sign = '+';
  } else if (monthlyBalance < 0) {
    badgeClass += 'badge-danger';
  } else {
    badgeClass += 'badge-secondary';
  }

  const balanceLabel = `${sign}${monthlyBalance}${unit}`;
  const title = `Per month balance : ${balanceLabel}`;
  return (<span> <span title={title} className={badgeClass}>{balanceLabel}</span></span>);
}

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

    return (
      <div className="account-details">
        <h3><FontAwesome name="book" /> {this.props.account.name}{account.showMonthlyBalance ? <MonthlyBalance transactions={transactions} unit={unit} /> : null}</h3>
        <div className="account-transactions">{renderedParts}</div>
      </div>
    );
  }
}

Account.propTypes = {
  account: PropTypes.object
};

export default Account;
