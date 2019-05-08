import React from 'react';
import moment from 'moment';
import { Line } from 'recharts';

import { addAmounts } from '../../utils/maths';

/**
 * Check wether a transaction happens on a given day
 * @param {Object} transaction 
 * @param {String} type 
 * @param {String} date 
 * @returns {Boolean}
 */
function shouldUseTransaction(transaction, type, date) {
  if ('start' in transaction && transaction.start > date) {
    return false;
  } else if ('end' in transaction && transaction.end < date) {
    return false;
  }

  switch (type) {
    case 'monthly': {
      const formatedDay = moment(date).format('D');
      return Array.isArray(transaction.day)
        ? transaction.day.map(day => day.toString()).includes(formatedDay)
        : formatedDay == transaction.day; // eslint-disable-line eqeqeq
    }
    case 'weekly': {
      const formatedDay = moment(date).format('E');
      return Array.isArray(transaction.day)
        ? transaction.day.map(day => day.toString()).includes(formatedDay)
        : formatedDay == transaction.day; // eslint-disable-line eqeqeq
    }
    case 'unique':
      return date === transaction.date;
    default:
      return false;
  }
}

/**
 * Get the used transactions for a given date
 * @param {Object} transactions
 * @param {String} date
 * @returns {Array}
 */
function getDateTransactions(transactions, date) {
  return ['monthly', 'weekly', 'unique']
    .reduce((allTransactions, type) => {
      const newTransactions = (type in transactions ? transactions[type] : [])
        .filter(transaction => shouldUseTransaction(transaction, type, date))
        .map(transaction => ({ ...transaction, type }));

      return allTransactions.concat(newTransactions);
    }, []);
}

/**
 * Get the transactions of a given day for a list of accounts
 * @param {Array} accounts 
 * @param {String} date 
 * @returns {Array}
 */
export function getAccountsDateTransactions(accounts, date) {
  return accounts.map(account => ({
    name: account.name,
    transactions: getDateTransactions(account.transactions, date),
  }));
}

/**
 * Prepare <Line /> elements for the graph
 * @param {Array} accounts 
 * @returns {Array}
 */
export function prepareGraphLines(accounts) {
  return accounts.map((account, i) => (
    <Line unit={account.unit || '€'}
      type="monotone"
      key={i}
      dot={false}
      dataKey={account.name}
      stroke={account.color}
    />
  ));
}

/**
 * Prepare values to be sent to graph component
 * @param {Array} accounts 
 * @param {Object} options 
 * @returns {Object}
 */
export function prepareGraphData(accounts, options) {
  const {
    duration,
    durationUnit,
    dateFormat,
  } = options;

  // @todo Start to compute with "earliest" accounts but only return in data
  // starting from "latest" account start date (in order to support "unsync" accounts info)

  // Get the earliest date from accounts to use as computation start date
  const startDate = accounts.reduce(
    (date, account) => account.date < date ? account.date : date,
    accounts[0].date
  );
  const endDate = moment(startDate).add(duration, durationUnit);
  const cursor = moment(startDate);

  const data = [];

  // Gather metadata from accounts
  const { previousValues } = accounts.reduce((metadata, account, i) => {
    const { name, amount } = account;
    metadata.previousValues[name] = amount;

    return metadata;
  }, { previousValues: {}, lines: [] });

  while (endDate > cursor) {
    const date = cursor.format(dateFormat);

    // Gather the value of each account at the given date
    const accountsValues = accounts.reduce((values, account) => {
      const transactions = getDateTransactions(account.transactions, date);

      if (transactions.length === 0) {
        // No operation for this account for this day, use previous value
        values[account.name] = previousValues[account.name];
      } else {
        // Compute the account's delta after the day's transactions
        const accountDailyDelta = transactions.reduce((delta, transaction) => delta + transaction.amount, 0);
        values[account.name] = addAmounts(previousValues[account.name], accountDailyDelta);

        previousValues[account.name] = values[account.name];
      }


      return values;
    }, {});

    data.push({ date, ...accountsValues });

    cursor.add(1, 'day');
  }

  return data;
}

export default {
  getAccountsDateTransactions,
  prepareGraphLines,
  prepareGraphData
};
