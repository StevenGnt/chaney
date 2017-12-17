'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import MainView from 'src/views/MainView';
import configureStore from 'src/store';

const store = configureStore();

ReactDOM.render(
	<Provider store={store}>
		<MainView />
	</Provider>,
	document.getElementById('chaney-app'));