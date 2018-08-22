import Actions from '../actions/actions';

const defaultReducer = (state, { type, payload }) => {
  switch (type) {
    case Actions.ACCOUNTS_RECIEVED:
      return { ...state, accounts: payload.accounts };

    default:
      return {};
  }
};

export default defaultReducer;
