import React, { Component } from 'react';
import { connect } from 'react-redux'

import actionsCreators from './actions/actionsCreators';
import MainPage from './containers/MainPage/MainPage.container';

import './App.css';

class App extends Component {
  componentDidMount() {
    this.props.dispatch(actionsCreators.fetchAccounts());
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Chaney III</h1>
        </header>
        <MainPage />
      </div>
    );
  }
}

export default connect()(App);
