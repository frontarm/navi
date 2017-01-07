import React, { Component, PropTypes } from 'react'


export default class Loader extends Component {
  static propTypes = {
    content: PropTypes.any,
    view: PropTypes.element.isRequired,
  }

  constructor(props) {
    super(props)

    if (typeof props.content == 'function') {
      props.content().then(
        (content) => {
          if (!this.state) this.state = { content }
          else if (!this.unmounted) this.setState({ content, busy: false }) 
        },
        (error) => {
          console.error("Error loading content with <Loader />:", error)
          if (!this.state) this.state = { error }
          else if (!this.unmounted) this.setState({ error, busy: false })  
        }
      )
      this.state = { busy: true }
    }
    else {
      this.state = { content: props.content }
    }
  }

  componentWillUnmount() {
    this.unmounted = true
  }

  render() {
    return React.cloneElement(this.props.view, Object.assign({}, this.props.view.props, this.state))
  }
}
