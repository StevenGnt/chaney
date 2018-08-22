import React from 'react';
import PropTypes from 'prop-types';

import Account from './components/Account';

class List extends React.Component {
  render() {
    const renderedAccounts = this.props.accounts
      .map(account => <Account key={account.id} account={account} />);

    return <div>{renderedAccounts}</div>;
  }
}

List.propTypes = {
  accounts: PropTypes.array
};

export default List;
