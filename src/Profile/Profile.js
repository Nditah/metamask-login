import React, { Component } from "react";
import Blockies from "react-blockies";
import jwtDecode from "jwt-decode";

import "./Profile.css";

class Profile extends Component {
  state = {
    loading: false,
    user: {},
    username: "",
  };

  API_URL = process.env.REACT_APP_DEV_API_URL;
  USER_INFO = "bezop-user:info";

  componentWillMount() {
    const { auth: { accessToken } } = this.props;
    const { payload: { id } } = jwtDecode(accessToken);
    console.log(`\r\n1. From Profile componentWillMount user id ${id}`);
    fetch(`${this.API_URL}/admins/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(response => response.json())
      .then(user => this.setState({ user }))
      .catch(window.alert);
  }

  handleChange = (e) => {
    let user = Object.assign({}, this.state.user);
    user[e.target.name] = e.target.value;
   this.setState({ user });
   console.log(this.state.user);
  };

  handleSubmit = (event) => {
    event.preventDefault();
    /*
    let data = {
      username: this.state.name,
      fullname: this.state.fullname,
      phone: this.state.phone,
      address: this.state.address,
      email: this.state.email,
    }
    */
   console.log(JSON.stringify(this.state.user ));

    const { auth: { accessToken } } = this.props;
    const { payload: { id } } = jwtDecode(accessToken);

    this.setState({ loading: true });
    
    fetch(`${this.API_URL}/admins/${id}`, {
      body: JSON.stringify(this.state.user ),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      method: "PUT"
    })
      .then(response => response.json())
      .then(responseJSON => {
        if(responseJSON.success && Object.keys(responseJSON.data).length > 1) {
          const user= responseJSON.data;
          this.setState({ loading: false, user });
          localStorage.setItem(this.USER_INFO, JSON.stringify(user)); 
        }else{
          window.alert(responseJSON.message);
        }
        
      })
      .catch(err => {
        window.alert(err);
        this.setState({ loading: false });
      });
  };

  render() {
    const { auth: { accessToken }, onLoggedOut } = this.props;
    const { payload: { publicAddress } } = jwtDecode(accessToken);
    const { loading, user } = this.state;

    const username = user && user.username;
    const fullname = user && user.fullname;
    const phone = user && user.phone;
    const address = user && user.address;
    const email = user && user.email;

    return (
      <div className="Profile">
      <h2>User Profile Page</h2>
        <p>
          Logged in as <Blockies seed={publicAddress} />
        </p>
        <div>
        My username is {username ? <b>{username}</b> : "not set."} <br/>
        My fullname is {fullname ? <b>{fullname}</b> : "not set."} <br/>
        My phone is {phone ? <b>{phone}</b> : "not set."} <br/>
        My address is {address ? <b>{address}</b> : "not set."} <br/>
        My email is {email ? <b>{email}</b> : "not set."} <br/>
        My publicAddress is <pre>{publicAddress}</pre>
        </div>
        <div>
          <label htmlFor="username">Change username: </label>
          <input name="username" onChange={this.handleChange} />
          <br/>
          <label htmlFor="fullname">Change fullname: </label>
          <input name="fullname" onChange={this.handleChange} />
          <br/>
          <label htmlFor="phone">Change phone: </label>
          <input name="phone" onChange={this.handleChange} />
          <br/>
          <label htmlFor="address">Change address: </label>
          <input name="address" onChange={this.handleChange} />
          <br/>
          <label htmlFor="email">Change email: </label>
          <input name="email" onChange={this.handleChange} />
          <br/>
          <button className="button Logout-mm" onClick={onLoggedOut}>Logout</button>
          <button className="button Submit-mm" disabled={loading} onClick={this.handleSubmit}> Submit</button>
        </div>

      </div>
    );
  }
}

export default Profile;
