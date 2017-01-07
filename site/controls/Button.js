import React, { Component, PropTypes } from 'react'


function DefaultButtonView({ element, children }) {
  return React.cloneElement(element, element.props, children)
}


export default class Button extends Component {
  static propTypes = {
    view: PropTypes.element.isRequired,
  }

  static defaultProps = {
    view: <DefaultButtonView />,
  }

  render() {
    const { view, className, style, disabled, children, ...other } = this.props
    
    const element =
      <button
        {...other}
        type='button'
        disabled={disabled}
      />

    return React.cloneElement(view, { className, style, disabled, element }, children)
  }
}
