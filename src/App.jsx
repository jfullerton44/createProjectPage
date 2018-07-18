import React, { Component } from 'react';
import './App.css';
import Dashboard from './dash-board';
const log = require('loglevel')

log.setDefaultLevel(true ? 'debug' : 'warn')

class App extends Component {

  render() {
    return (
      <div className="App">
        {/* <header className="App-header">
          <h1 className="App-title">ixo Keysafe consumer</h1>
        </header> */}
        <Dashboard/>
        {/* <br></br>
        Paste the Project string in the textbox 
        <br></br>
        and click "ixo Sign and Create" to create your project */}
      </div>
    );
  }
}

export default App;
