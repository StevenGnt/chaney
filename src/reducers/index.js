import Actions from '../actions/actions';

const defaultReducer = (state, { type, payload }) => {
  switch (type) {
    case Actions.ACCOUNTS_RECIEVED:
      return { ...state, accounts: payload.accounts };

    case Actions.GRAPHS_CONFIG_RECEIVED:
      return { ...state, graphsConfig: payload.graphsConfig };

    default:
      return {};
  }
};

export default defaultReducer;
