import React, { Component } from 'react';
import './App.css';
import Dashboard from './dash-board';
const log = require('loglevel')

log.setDefaultLevel(true ? 'debug' : 'warn')

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
        <br></br><br></br>
          <h1 className="App-title">Project Creation Page</h1>
        </header>
        <Dashboard/>
      </div>
    );
  }
}

export default App;
