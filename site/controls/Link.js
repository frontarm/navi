import React, { Component, PropTypes } from 'react'
import { routesMatch } from 'junctions'


function isLeftClickEvent(event) {
  return event.button === 0
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
}


class LinkContext extends Component {
  static propTypes = {
    createRoute: PropTypes.func.isRequired,
    currentRoute: PropTypes.object,
    locate: PropTypes.func.isRequired,
  }

  static childContextTypes = {
    createRoute: PropTypes.func.isRequired,
    currentRoute: PropTypes.object,
    locate: PropTypes.func.isRequired,
  }

  getChildContext() {
    const props = this.props
    return {
      createRoute: props.createRoute,
      currentRoute: props.currentRoute,
      locate: props.locate,
    }
  }

  render() {
    return this.props.children
  }
}


function DefaultLinkView({ element, active, children }) {
  return React.cloneElement(element, element.props, children)
}


class Link extends Component {
  static Context = LinkContext

  static propTypes = {
    exact: PropTypes.bool,
    onClick: React.PropTypes.func,
    page: PropTypes.string.isRequired,
    target: React.PropTypes.string,
    view: PropTypes.element.isRequired,
  }

  static contextTypes = {
    createRoute: PropTypes.func.isRequired,
    currentRoute: PropTypes.object,
    locate: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  }

  static defaultProps = {
    view: <DefaultLinkView />,
    exact: false,
  }

  handleClick = (event) => {
    if (this.props.onClick) {
      this.props.onClick(event)
    }

    if (event.defaultPrevented) {
      return
    }

    var history = this.props.history || this.context.history

    if (!history) {
      throw new Error('<Link> requires a history object to be passed in, either via props or via context.')
    }

    if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
      return
    }

    // If target prop is set (e.g. to "_blank"), let browser handle link.
    if (this.props.target) {
      return
    }

    event.preventDefault()

    const route = this.context.createRoute(this.props.page)
    const location = this.context.locate(route)

    history.push(location)
  }

  render() {
    const { history, page, view, exact, children, ...other } = this.props
    
    const route = this.context.createRoute(page)
    const active = this.context.currentRoute && routesMatch(this.context.currentRoute, route, exact)
    const location = this.context.locate(route)
    const href = location.pathname + (location.search || '')

    const element =
      <a
        {...other}
        onClick={this.handleClick}
        href={href}
      />

    return React.cloneElement(view, { element, active }, children)
  }
}


export default Link
