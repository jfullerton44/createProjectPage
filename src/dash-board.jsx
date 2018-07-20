import React from 'react';
import { Ixo } from 'ixo-module';
import Launchbutton from './launch-button';
import Web3 from 'web3';
import swal from 'sweetalert';
import utf8 from 'utf8';
import base64 from 'base-64'


export default class Dashboard extends React.Component {

  constructor(props) {
    super(props);

    this.state = { messageBody: '', ixo: null, messageBody2: '', messageBody3: '', stateHash: null, globProjJSON: '' }

    this.blockchainProviders = {
      metamask: { id: 0, doShow: false, windowKey: "web3", extension: "Metamask", provider: null },
      ixo_keysafe: { id: 1, doShow: true, windowKey: "ixoKs", extension: "IXO Keysafe", provider: null }
    };

    // This binding is necessary to make `this` work in the callback
    this.handleExtensionLaunch = this.handleExtensionLaunch.bind(this);
    this.handleMessageBodyChanged = this.handleMessageBodyChanged.bind(this);
    this.handleMessageBodyChanged2 = this.handleMessageBodyChanged2.bind(this);
    this.handleMessageBodyChanged3 = this.handleMessageBodyChanged3.bind(this);
    this.getEthereumAddressAsync = this.getEthereumAddressAsync.bind(this);
    this.encodeJSON = this.encodeJSON.bind(this);
    this.uploadAndInsert = this.uploadAndInsert.bind(this);

    if (this.blockchainProviders.metamask.doShow) {
      this.initProvider(this.blockchainProviders.metamask);
    }
    if (this.blockchainProviders.ixo_keysafe.doShow) {
      this.initProvider(this.blockchainProviders.ixo_keysafe);
    }

    // this.signMessageWithProvider = this.signMessageWithProvider.bind(this);
    this.signData = this.signData.bind(this);

  }

  componentDidMount() {
    this.setState({ ixo: new Ixo() });
  }

  initProvider(blockchainProvider) {
    if (!window[blockchainProvider.windowKey]) {
      blockchainProvider.doShow = false;
      window.alert(`Please install ${blockchainProvider.extension} first.`);
    } else {
      if (!blockchainProvider.provider) {
        if (blockchainProvider.id === this.blockchainProviders.metamask.id) {
          blockchainProvider.provider = new Web3(window[blockchainProvider.windowKey].currentProvider);
        } else if (blockchainProvider.id === this.blockchainProviders.ixo_keysafe.id) {
          // blockchainProvider.provider = window[blockchainProvider.windowKey].currentProvider;
          const IxoKeysafeInpageProvider = window[blockchainProvider.windowKey]
          blockchainProvider.provider = new IxoKeysafeInpageProvider();
        }
      }
    }
  }

  handleMessageBodyChanged(e) {
    this.setState({ messageBody: e.target.value });
  }
  handleMessageBodyChanged2(e) {
    this.setState({ messageBody2: e.target.value });
  }

  handleMessageBodyChanged3(e) {
    this.setState({ messageBody3: e.target.value });
  }

  handleExtensionLaunch(providerId) {
    if (this.state.messageBody.length === 0) {
      return;
    }
    const blockchainProvider = (providerId === this.blockchainProviders.metamask.id) ? this.blockchainProviders.metamask : this.blockchainProviders.ixo_keysafe;
    var PDSURLs = ["http://beta.elysian.ixo.world:5000/"]
    this.uploadAndInsert(PDSURLs[0], this.state.messageBody, blockchainProvider);
  }

  signData(message, blockchainProvider) {
    if (blockchainProvider.id === this.blockchainProviders.ixo_keysafe.id) {
      this.blockchainProviders.ixo_keysafe.provider.requestSigning(message, (error, response) => {
        console.log(`Dashboard handling received response for SIGN response: \n${JSON.stringify(response)}\n, error: \n${JSON.stringify(error)}\n`)
      })
      return
    } else {
      this.getEthereumAddressAsync().then(address => {
        console.log(`${blockchainProvider.extension} -> Address: ${address}`);

        // actual signing ->>
        var dataInHex = '0x' + new Buffer(message).toString('hex');

        blockchainProvider.provider.eth.personal.sign(dataInHex, address, "test password!")
          .then(console.log);
      });
    }
  }

  // bit64 encoding function; "text" parameter is a json string
  encodeJSON(text) {
    // var utf8 = require('utf8');
    // var binaryToBase64 = require('binaryToBase64');
    var bytes = utf8.encode(text);
    var encoded = base64.encode(bytes);
    return encoded;
  }

  // this method will retrieve the specific Object ID from the URL
  getOIDFromURL() {
    var url = window.location.href
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
    var obj = {};
    if (queryString) {
      queryString = queryString.split('#')[0];
      var arr = queryString.split('&');
      for (var i = 0; i < arr.length; i++) {
        var a = arr[i].split('=');
        var paramNum = undefined;
        var paramName = a[0].replace(/\[\d*\]/, function (v) {
          paramNum = v.slice(1, -1);
          return '';
        });
        var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
        paramName = paramName.toLowerCase();
        paramValue = paramValue.toLowerCase();
        if (obj[paramName]) {
          if (typeof obj[paramName] === 'string') {
            obj[paramName] = [obj[paramName]];
          }
          if (typeof paramNum === 'undefined') {
            obj[paramName].push(paramValue);
          }
          else {
            obj[paramName][paramNum] = paramValue;
          }
        }
        else {
          obj[paramName] = paramValue;
        }
      }
    }
    return obj;
  }

  uploadAndInsert(PDSURL, message, blockchainProvider) {
    var encodedClaimSchema = this.encodeJSON(this.state.messageBody2);
    console.log("Encoded schema json: " + encodedClaimSchema);
    let dataUrl1 = 'data:application/json;base64, ' + encodedClaimSchema;
    var hash = this.state.ixo.project.createPublic(dataUrl1, PDSURL).then((result) => {
      // check output, it should now output the hash   
      console.log("Result: " + JSON.stringify(result));

      // display the "templates" property of project json
      var projectJSON = JSON.parse(message);
      console.log("Project JSON templates section" + JSON.stringify(projectJSON['templates']));

      // insert schema hash into project json 
      console.log("schema hash: " + JSON.stringify(result.result));
      projectJSON['templates']['schema'] = JSON.stringify(result.result);


      var encodedClaimForm = this.encodeJSON(this.state.messageBody3);
      console.log("Encoded form json: " + encodedClaimForm);
      let dataUrl2 = 'data:application/json;base64, ' + encodedClaimForm;
      var hash2 = this.state.ixo.project.createPublic(dataUrl1, PDSURL).then((result) => {
        // check output, it should now output the hash   
        console.log("Result: " + JSON.stringify(result));

        // insert form hash into project json 
        projectJSON['templates']['form'] = JSON.stringify(result.result);

        // check to see if templates were inserted into project json
        console.log("Project JSON templates section after additions: " + JSON.stringify(projectJSON['templates']));

        if (blockchainProvider.id === this.blockchainProviders.ixo_keysafe.id) {
          this.blockchainProviders.ixo_keysafe.provider.requestSigning(JSON.stringify(projectJSON), (error, response) => {
            console.log("Message" + JSON.stringify(projectJSON))
            //alert(`Dashboard handling received response for SIGN response: ${JSON.stringify(response)}, error: ${JSON.stringify(error)}`)
            console.log(`Dashboard handling received response for SIGN response: \n${JSON.stringify(response)}\n, error: \n${JSON.stringify(error)}\n`)
            try {
              // this.state.ixo.project.createProject(JSON.parse(message), response, PDSURL).then((result) => {
              console.log("Print project json: " + JSON.stringify(projectJSON));
              this.state.ixo.project.createProject(projectJSON, response, PDSURL).then((result) => {              console.log(`Project Details:   \n${JSON.stringify(result)}`)
                swal({
                  title: 'Your project has been created!',
                  text: 'Click OK to be redirected to ixo.world and get started!',
                  icon: "success"
                })
                  .then(redirect => {
                    if (redirect) {
                      window.location.href = 'http://beta.www.ixo.world/';
                    }
                  });
              })
            } catch (error) {
              console.log("Incorrect PDS URL format")
              swal("ERROR","Please make sure that you have pasted everything exactly as it appears in the email.", "error")
            }
  
          })
          return
        } else {
          this.getEthereumAddressAsync().then(address => {
            console.log(`${blockchainProvider.extension} -> Address: ${address}`);
  
            // actual signing ->>
            var dataInHex = '0x' + new Buffer(message).toString('hex');
  
            blockchainProvider.provider.eth.personal.sign(dataInHex, address, "test password!")
              .then(console.log);
          });
        }
      }).catch((error) => {
        console.log("Error, unable to return form");
        swal("ERROR","Please make sure that you have pasted everything exactly as it appears in the email.", "error")
        console.log(error);
      });

   
    }).catch((error) => {
      console.log("Error, unable to return schema hash");
      swal("ERROR","Please make sure that you have pasted everything exactly as it appears in the email.", "error")
      console.log(error);
    });
  }

  getEthereumAddressAsync() {
    const eth = this.blockchainProviders.metamask.provider.eth;
    return new Promise((resolve, reject) => {
      // resolve(provider.debug());
      eth.getAccounts(function (error, accounts) {
        if (error || 0 === accounts.length) {
          reject(error);
        }
        resolve(accounts[0]);
      });
    });
  }


  render() {
    return (
      <div>
        <br></br>
      <b>1. Paste the Schema text here:</b>
      <br></br>
      <textarea style={{ height: 100, width: 400 }}
        value={this.state.messageBody2} 
        onChange={this.handleMessageBodyChanged2} />
      <br></br>
      <br></br>
      <br></br>
      <b>2. Paste the Form text here:</b>
      <br></br>
      <textarea style={{ height: 100, width: 400 }}
        value={this.state.messageBody3} 
        onChange={this.handleMessageBodyChanged3}/>
      <br></br>
      <br></br>
      <br></br>
      <b>3. Paste the Project Details here:</b><br></br>
      <textarea style={{ height: 100, width: 400 }}
        value={this.state.messageBody} 
        onChange={this.handleMessageBodyChanged} /> 
      <br></br>
      <br></br>
        <Launchbutton
          provider={this.blockchainProviders.ixo_keysafe.id}
          title="Sign and Create Project"
          handleLaunchEvent={this.handleExtensionLaunch} />
        
        {this.blockchainProviders.ixo_keysafe.doShow}

      </div>
    )
  }
}
