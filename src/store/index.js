'use strict';

import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

import appReducer from 'src/reducers';

export default function configureStore(state = {}) {
    return createStore(appReducer, state, applyMiddleware(thunkMiddleware, createLogger()));
};