import React, { Component, PropTypes } from 'react'


function DefaultInputView({ element, disabled }) {
  return element
}


export default class Input extends Component {
  static propTypes = {
    view: PropTypes.element.isRequired,
  }

  static defaultProps = {
    view: <DefaultInputView />,
  }

  render() {
    const { view, className, style, disabled, ...other } = this.props
    
    const element =
      <input
        {...other}
        disabled={disabled}
      />

    return React.cloneElement(view, { className, style, disabled, element })
  }
}
