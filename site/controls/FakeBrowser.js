import React, { Component, PropTypes } from 'react'
import Button from './Button'
import Input from './Input'
import BrowserView from '../views/BrowserView'


function createURL(location) {
  return location.pathname + location.search
}


export default class FakeBrowser extends Component {
  static propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,

    history: PropTypes.object.isRequired,
    view: PropTypes.element.isRequired,
    isLoading: PropTypes.bool,
  }

  static defaultProps = {
    view: <BrowserView />,
  }

  constructor(props) {
    super(props)

    this.state = { url: null }
    this.unlisten = this.props.history.listen(() => this.setState({ url: null }))
  }

  componentWillUnmount() {
    this.unlisten()
  }

  handleChangeUrl = e => {
    this.setState({ url: e.target.value })
  }

  handleUrlKeyDown = e => {
    if (e.key == 'Enter') {
      this.setState({ url: null })
      this.props.history.push(e.target.value)
    }
  }

  render() {
    const props = this.props
    const state = this.state
    const history = props.history

    const backControl =
      <Button
        onClick={history.goBack}
        disabled={!history.canGo(-1)}
      />
    const forwardControl =
      <Button
        onClick={history.goForward}
        disabled={!history.canGo(1)}
      />
    const urlControl =
      <Input
        value={state.url || createURL(history.location)}
        onChange={this.handleChangeUrl}
        onKeyDown={this.handleUrlKeyDown}
      />

    return React.cloneElement(props.view, {
      className: props.className,
      style: props.style,
      isLoading: props.isLoading,

      backControl,
      forwardControl,
      urlControl,
    }, props.children)
  }
}
