import React, { Component } from 'react';
import { NavProvider, NavContent } from 'react-navi';

class App extends Component {
  render() {
    return (
      <NavProvider navigation={this.props.navigation}>
        <NavContent />
      </NavProvider>
    );
  }
}

export default App;
