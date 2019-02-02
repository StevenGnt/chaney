import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';

import registerServiceWorker from './registerServiceWorker';
import App from './App';
import reducers from './reducers';

import './index.css';

import 'bootstrap/dist/css/bootstrap.css'

const store = createStore(reducers, applyMiddleware(thunk));

const ConnectedApp = (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.render(ConnectedApp, document.getElementById('root'));
registerServiceWorker();
