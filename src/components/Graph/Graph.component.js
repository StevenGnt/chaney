import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line
} from 'recharts';

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
    case 'monthly':
      return moment(date).format('D') == transaction.day; // eslint-disable-line eqeqeq
    case 'weekly':
      return moment(date).format('E') == transaction.day; // eslint-disable-line eqeqeq
    case 'unique':
      return date === transaction.date;
    default:
      return false;
  }
}

const usedColors = [];

/**
 * Get the color of the stroke for an account (from settings or a random non-used color)
 * @param {Object} account 
 * @returns {String}
 */
function getAccountStrokeColor(account) {
  if ('color' in account) {
    usedColors.push(account.color);
    return account.color;
  }

  let randomColor;

  while (!randomColor) {
    randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    if (usedColors.includes(randomColor)) {
      randomColor = null;
    } else {
      usedColors.push(randomColor);
      return randomColor;
    }
  }
}

/**
 * Prepare values to be sent to graph component
 * @param {Array} accounts 
 * @param {Object} options 
 * @returns {Object}
 */
function prepareGraphData(accounts, options) {
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
  const { previousValues, lines } = accounts.reduce((metadata, account, i) => {
    const { name, amount } = account;
    metadata.previousValues[name] = amount;
    metadata.lines.push(
      <Line unit="€"
        type="monotone"
        key={i}
        dot={false}
        dataKey={name}
        stroke={getAccountStrokeColor(account)}
      />
    );

    return metadata;
  }, { previousValues: {}, lines: [] });

  while (endDate > cursor) {
    const date = cursor.format(dateFormat);

    const accountsValues = accounts.reduce((values, account) => {
      values[account.name] = ['monthly', 'weekly', 'unique']
        // Only keep values for this day
        .reduce((transactions, type) => {
          const newTransactions = type in account.transactions
            ? account.transactions[type].filter(transaction => shouldUseTransaction(transaction, type, date))
            : [];

          return transactions.concat(newTransactions);
        }, [])
        // Add every transaction amount for this day
        .reduce((value, transaction) => value += transaction.amount, previousValues[account.name]);

      previousValues[account.name] = values[account.name];

      return values;
    }, {});

    data.push({ date, ...accountsValues });

    cursor.add(1, 'day');
  }

  return { data, lines };
}

class Graph extends React.Component {
  constructor() {
    super();

    this.onChartClick = this.onChartClick.bind(this);
  }

  /**
   * Handle click on the chart component
   * @param {Object} click 
   * @param {Object} event 
   */
  onChartClick(click, event) {
    // @todo Show the information for the clicked day
  }

  render() {
    const { accounts, options } = this.props;

    const { data, lines } = prepareGraphData(accounts, options);

    return (
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={data} onClick={this.onChartClick}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {lines}
        </LineChart>
      </ResponsiveContainer>
    );
  }
}

Graph.propTypes = {
  accounts: PropTypes.array,
  options: PropTypes.shape({
    duration: PropTypes.number.required,
    durationUnit: PropTypes.oneOf(['months']).required,
    dateFormat: PropTypes.string.required,
  })
};

export default Graph;
