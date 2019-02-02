import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

import Graph from '../../components/Graph/Graph.component';
import List from '../../components/List/List.component';

import CONFIG from '../../config';

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

class MainPage extends React.Component {

  render() {
    const { accounts } = this.props;

    if (!accounts) {
      return '...';
    } else if (accounts.length === 0) {
      return <div>No account</div>;
    }

    const graphOptions = {
      duration: CONFIG.DURATION,
      durationUnit: CONFIG.DURATION_UNIT,
      dateFormat: CONFIG.DATE_FORMAT,
    };

    const preparedGraphAccounts = accounts.map(account => ({
      ...account,
      color: getAccountStrokeColor(account),
    }));

    return (
      <React.Fragment>
        <Graph accounts={preparedGraphAccounts} options={graphOptions} />
        <List accounts={accounts} />
      </React.Fragment>
    );
  }
}

MainPage.propTypes = {
  accounts: PropTypes.array
};

const mapStateToProps = state => ({
  accounts: state.accounts
});

export default connect(mapStateToProps)(MainPage);
