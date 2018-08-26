import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';

import AmountLabel from '../../AmountLabel/AmountLabel.component';

import './TransactionsPanel.css';

const TransactionsPanel = props => {
  const { accounts, date } = props;

  const filteredAccounts = accounts.filter(account => account.transactions.length > 0);

  return (
    <div className="transactions-panel-wrapper">
      <button className="close-button" type="button" onClick={props.onClose}>
        <FontAwesome name="times" />
      </button>

      <div className="transactions-panel-content">
        <h5>Transactions on {date}</h5>
        {filteredAccounts.length > 0 ?
          filteredAccounts.map((account, i) => (
            <div className="transactions-list" key={i}>
              <span className="account-name">{account.name}</span>
              <ul>
                {account.transactions.map((transaction, i) =>
                  <li key={i}><AmountLabel amount={transaction.amount} /> {transaction.name}</li>
                )}
              </ul>
            </div>
          ))
          : <div className="transactions-no-transaction">No transaction</div>
        }
      </div>
    </div>
  );
};


TransactionsPanel.propTypes = {
  accounts: PropTypes.array,
  date: PropTypes.string,
};

export default TransactionsPanel;
