import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

import Graph from '../../components/Graph/Graph.component';
import List from '../../components/List/List.component';

class MainPage extends React.Component {

  render() {
    const { accounts } = this.props;

    if (!accounts) {
      return '...';
    } else if (accounts.length === 0) {
      return <div>No account</div>;
    }

    const graphOptions = {
      duration: 6,
      durationUnit: 'months',
      dateFormat: 'YYYY-MM-DD',
    };

    return (
      <React.Fragment>
        <Graph accounts={accounts} options={graphOptions} />
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
