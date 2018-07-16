import React, { Component } from "react";
import Web3 from "web3";

import "./Login.css";

let web3 = null; // Will hold the web3 instance

class Login extends Component {
  state = {
    loginLoading: false, // Loading login button state
    signupLoading: false // Loading signup button state
  };

  API_URL = process.env.REACT_APP_DEV_API_URL;

// signup function placeholder
  handleSignup = () => {
    const { onLoggedIn } = this.props;
    const authType = "signup"; 
    console.log(authType, onLoggedIn);
    return false;   
  }

  // //////////////////////////////////////////////////
  // Step 1. Login or Signup reads address, checks backend
  // //////////////////////////////////////////////////

  getPublicAddress = () => {
    if (!window.web3) {
      window.alert("Please install MetaMask first.");
      return;
    }
    if (!web3) {
      // We don"t know window.web3 version, so we use our own instance of web3
      // with provider given by window.web3
      web3 = new Web3(window.web3.currentProvider);
    }
    if (!web3.eth.coinbase) {
      window.alert("Please activate MetaMask first.");
      return;
    }
    const publicAddress = web3.eth.coinbase.toLowerCase();
    return publicAddress;
  }


  handleSignup = () => {
    const { onLoggedIn } = this.props;
    const authType = "signup";
    const userType = "admin";
    
    const publicAddress = this.getPublicAddress();

    this.setState({ signupLoading: true });

    console.log(`\r\n1a. From handleLogin Given type ${authType}, Address ${publicAddress} `);

    // 1a. Look if user with current publicAddress is already present on backend
    fetch(`${this.API_URL}/${userType}/${authType}/publicaddress/${publicAddress}`)
      .then(response => response.json())

      // 1b. If yes, retrieve { publicAddress, nonce, authType } from responceJSON.data
      .then((responceJSON) => {
        if(responceJSON.success && Object.keys(responceJSON.data).length > 1 ){
          console.log(`\r\n1b. From handleLogin Return Address, Nonce,\
           type ${JSON.stringify(responceJSON.data)}`);
          return (responceJSON.data);
        }else{
          console.log(`\r\n1b. From handleLogin Return Error ${responceJSON.message}`);
          throw new Error(responceJSON.message);
        }
      })

      // 2. Popup MetaMask confirmation modal to sign message
      .then(this.handleSignMessage)

      // 3. Send signature to backend on the /auth route
      .then(this.handleAuthenticate)

      // 4. Pass accessToken back to parent component (to save it in localStorage)
      .then(onLoggedIn)

      .catch(err => {
        window.alert(err);
        this.setState({ signupLoading: false });
      });
  }

  handleLogin = () => {
    const { onLoggedIn } = this.props;
    const authType = "login";
    const userType = "admin";
    
    const publicAddress = this.getPublicAddress();

    this.setState({ loginLoading: true });

    console.log(`\r\n1a. From handleLogin Given type ${authType}, Address ${publicAddress} `);

    // 1a. Look if user with current publicAddress is already present on backend
    fetch(`${this.API_URL}/${userType}/${authType}/publicaddress/${publicAddress}`)
      .then(response => response.json())

      // 1b. If yes, retrieve { publicAddress, nonce, authType } from responceJSON.data
      .then((responceJSON) => {
        if(responceJSON.success && Object.keys(responceJSON.data).length > 1 ){
          console.log(`\r\n1b. From handleLogin Return Address, Nonce,\
           type ${JSON.stringify(responceJSON.data)}`);
          return (responceJSON.data);
        }else{
          console.log(`\r\n1b. From handleLogin Return Error ${responceJSON.message}`);
          throw new Error(responceJSON.message);
        }
      })

      // 2. Popup MetaMask confirmation modal to sign message
      .then(this.handleSignMessage)

      // 3. Send signature to backend on the /auth route
      .then(this.handleAuthenticate)

      // 4. Pass accessToken back to parent component (to save it in localStorage)
      .then(onLoggedIn)

      .catch(err => {
        window.alert(err);
        this.setState({ loginLoading: false });
      });
  }

  // //////////////////////////////////////////////////
  // Step 2. Record Found, thus Popup MetaMask modal to sign message  to login
  // //////////////////////////////////////////////////

handleSignMessage = ({ publicAddress, nonce, authType }) => {
  console.log(`\r\n2a. From handleSignMessage Given Address ${publicAddress},\
   Nonce ${nonce}, type ${authType}`);
  return new Promise((resolve, reject) =>
    web3.personal.sign(
      web3.fromUtf8(`I am signing my one-time nonce: ${nonce} to ${authType}`),
      publicAddress,
      (err, signature) => {
        if (err) return reject(err);
        console.log(`\r\n2b. From handleSignMessage Return Address ${publicAddress}\
         signature ${signature} type ${authType}`);
        return resolve({ publicAddress, signature, authType });
      }
    )
  );
}

  // //////////////////////////////////////////////////
  // Step 3. Send signature to backend on the /auth route
  // //////////////////////////////////////////////////

  handleAuthenticate = ({ publicAddress, signature, authType }) => {
    console.log(`\r\n3a. From handleAuthenticate Given Address ${publicAddress}\
     signature ${signature} type ${authType}`);
    return fetch(`${this.API_URL}/admin/auth/${authType}`, {
      body: JSON.stringify({ publicAddress, signature }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    }).then((response) => response.json())
      .then((responseJSON) => {
        console.log(`\r\n3b. From handleAuthenticate Return token ${JSON.stringify(responseJSON)} `);
        if(responseJSON.success && Object.keys(responseJSON.data).length === 1) {
          return responseJSON.data;
        }else{
          return window.alert(responseJSON.message);
        }
      });
  }


  render() {
    const { loginLoading, signupLoading } = this.state;
    return (
      <div>
        <p>
          Please login with MetaMask and Click on Signup or Login to Athenticate Admin
        </p>
        <p>
        <button className="button Login-mm" onClick={this.handleLogin}>
          {loginLoading ? "Loading..." : "Login with MetaMask"}
        </button>
        </p>
        <p>
        <button className="button Signup-mm" onClick={this.handleSignup}>
          {signupLoading ? "Loading..." : "Signup with MetaMask"}
        </button>
        </p>
      </div>
    );
  }
} // end Login Componenet Class

export default Login;
