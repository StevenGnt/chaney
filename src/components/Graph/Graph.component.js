import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

import {
  prepareGraphData,
  prepareGraphLines,
  getAccountsDateTransactions
} from './Graph.utils';

import TransactionsPanel from './components/TransactionsPanel.component';

import './GraphComponent.css';

class Graph extends React.Component {
  constructor() {
    super();

    this.onChartClick = this.onChartClick.bind(this);
    this.onPanelClose = this.onPanelClose.bind(this);

    this.state = {
      transactionDetailsDate: null,
    };
  }

  /**
   * Handle click on the chart component
   * @param {Object} click 
   * @param {Object} event 
   */
  onChartClick(click, event) {
    if (click) {
      const { activeLabel } = click;
      this.setState(({ transactionDetailsDate }) => ({
        transactionDetailsDate: activeLabel === transactionDetailsDate ? null : activeLabel,
      }));
    }
  }

  onPanelClose() {
    this.setState({ transactionDetailsDate: null });
  }

  render() {
    const { accounts, options } = this.props;
    const { transactionDetailsDate } = this.state;

    const data = prepareGraphData(accounts, options);
    const lines = prepareGraphLines(accounts, options);

    const transactionPanel = transactionDetailsDate
      ? <TransactionsPanel
        date={transactionDetailsDate}
        accounts={getAccountsDateTransactions(accounts, transactionDetailsDate)}
        onClose={this.onPanelClose}
      />
      : null;

    return (
      <div className="graph-component-wrapper">
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
        {transactionPanel}
      </div>
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
