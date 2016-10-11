import React, { Component } from 'react'


export default class ContactDetailsScreen extends Component {
  render() {
    return <div>Contact id: {this.props.params.id}</div>
  }
}
