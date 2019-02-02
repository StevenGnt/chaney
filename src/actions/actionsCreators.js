import Actions from './actions';

import mockAccounts from '../mock/accounts.json';

export function fetchAccounts() {
  return dispatch => {
    dispatch({ type: Actions.FETCH_ACCOUNTS });

    // @todo Make async stuff to load mocked accounts

    dispatch(accountsRecieved(mockAccounts));
  };
}

export function accountsRecieved(accounts) {
  return {
    type: Actions.ACCOUNTS_RECIEVED,
    payload: { accounts }
  };
}

export default { fetchAccounts, accountsRecieved };
