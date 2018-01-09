import * as React from 'react'
import * as PropTypes from 'prop-types'


export class NavigationProvider extends React.Component<any> {
  static childContextTypes = {
    navigation: PropTypes.object,
  }

  getChildContext() {
    return {
      navigation: this.props.navigation,
    }
  }

  render() {
    return this.props.children
  }
}