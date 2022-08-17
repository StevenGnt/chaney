import React, { Component } from 'react';
import { connect } from 'react-redux'

import actionsCreators from './actions/actionsCreators';
import MainPage from './containers/MainPage/MainPage.container';

import './assets/fonts/BAD GRUNGE.ttf';
import './App.css';

class App extends Component {
  componentDidMount() {
    this.props.dispatch(actionsCreators.fetchAccounts());
    this.props.dispatch(actionsCreators.fetchGraphsConfig());
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Chaney 3</h1>
        </header>
        <MainPage />
      </div>
    );
  }
}

export default connect()(App);
