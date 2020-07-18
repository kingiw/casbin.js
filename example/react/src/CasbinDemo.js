import React, {Component} from 'react';
import {Authorizer} from 'casbin.js';
import permissions from './permissions.json'

export default class CasbinDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.user
    }
    this.auth = new Authorizer("manual");
  }

  componentWillReceiveProps(nextProps) {
    this.setState({user: nextProps.user});
  }

  render() {
    // set the permission when the user identity changes.
    this.auth.setPermission(permissions[this.state.user]);
    const alice_div = <p>This is alice's data.</p>
    const bob_div = <p>This is bob's data.</p>
    return (
      <div>
        <p>====</p>
        { this.auth.can('read', 'alice_data') && alice_div }
        { this.auth.can('read', 'bob_data') && bob_div}
        <p>====</p>
      </div>
    )
  }
}
