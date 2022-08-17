import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

import Graph from '../../components/Graph/Graph.component';
import List from '../../components/List/List.component';

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

function DetailedGraph({ accounts, graphConfig }) {
  const preparedGraphAccounts = accounts.map(account => ({
    ...account,
    color: getAccountStrokeColor(account),
  }));

  return (
    <div>
      <h2>{graphConfig.title}</h2>
      <Graph accounts={preparedGraphAccounts} options={graphConfig.graphOptions} />
      <List accounts={accounts} />
    </div>
  );
}

function getQueryParameters() {
  return window.location.search.replace('?', '')
    .split('&')
    .reduce((final, row) => {
      const [key, value] = row.split('=');
      return { ...final, [key]: value };
    }, {});
}

function getQueryParameter(name) {
  const parameters = getQueryParameters();

  return parameters[name];
}

class MainPage extends React.Component {
  render() {
    const { accounts, graphsConfig } = this.props;

    if (!accounts) {
      return '...';
    } else if (accounts.length === 0) {
      return <div>No account</div>;
    }

    // @todo Actually implement a simulation feature
    const simulationName = getQueryParameter('simulation');
    const filterFn = transaction => {
      const { simulation } = transaction;
      if (!simulation) {
        return true;
      }

      return (typeof simulation === 'string' ? [simulation] : simulation).includes(simulationName);
    };

    const preparedAccounts = accounts.map(account => {
      return {
        ...account,
        transactions: {
          ...account.transactions,
          monthly: (account.transactions.monthly || []).filter(filterFn),
          weekly: (account.transactions.weekly || []).filter(filterFn),
          unique: (account.transactions.unique || []).filter(filterFn),
        },
      }
    });

    return (
      <React.Fragment>
        {
          graphsConfig.map((graphConfig, i) => (
            <DetailedGraph
              key={i}
              graphConfig={graphConfig}
              accounts={preparedAccounts.filter(account => graphConfig.accounts.includes(account.id))}
            />
          ))
        }
      </React.Fragment>
    );
  }
}

MainPage.propTypes = {
  accounts: PropTypes.array
};

function mapStateToProps(state) {
  return {
    accounts: state.accounts,
    graphsConfig: state.graphsConfig,
  }
}

export default connect(mapStateToProps)(MainPage);
