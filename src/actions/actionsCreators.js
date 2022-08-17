import Actions from './actions';

import mockAccounts from '../mock/accounts.json';
import mockGraphsConfig from '../mock/graphs.json';

export function fetchAccounts() {
  return dispatch => {
    // @todo Make async stuff to load mocked accounts
    dispatch(accountsRecieved(mockAccounts));
  };
}

export function fetchGraphsConfig() {
  return dispatch => {
    // @todo Make async stuff to load mocked accounts
    dispatch(graphsConfigReceived(mockGraphsConfig));
  };
}

// Action creators
function accountsRecieved(accounts) {
  return {
    type: Actions.ACCOUNTS_RECIEVED,
    payload: { accounts }
  };
}

function graphsConfigReceived(graphsConfig) {
  return {
    type: Actions.GRAPHS_CONFIG_RECEIVED,
    payload: { graphsConfig }
  };
}

export default { fetchAccounts, fetchGraphsConfig };
