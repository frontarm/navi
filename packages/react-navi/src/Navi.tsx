import * as React from 'react'
import { BrowserNavigation, Route, Matcher, createBrowserNavigation } from 'navi'
import { NaviProvider } from './NaviProvider'
import { NaviView, NaviViewProps } from './NaviView'

export interface NaviProps<Context extends object> extends NaviViewProps {
  basename?: string

  context?: Context

  /**
   * Navi will attempt to detect a non browser environment in order to
   * prevent rendering of <Suspense>, but if it fails, you can manually
   * set `fallback` to `undefined`.
   */
  fallback?: React.ReactNode | undefined

  history?: any

  routes?: Matcher<Context>
}

export class Navi<Context extends object={}> extends React.Component<NaviProps<Context>> {
  static defaultProps = {
    fallback: undefined,
  }

  navigation: BrowserNavigation<Context, Route>

  constructor(props: NaviProps<Context>) {
    super(props)
    this.navigation = createBrowserNavigation({
      basename: props.basename,
      context: props.context,
      history: props.history,
      routes: props.routes,
    })
  }

  render() {
    let { basename, fallback, history, routes, ...viewProps } = this.props
    return (
      <NaviProvider fallback={fallback} navigation={this.navigation}>
        <NaviView {...viewProps} />
      </NaviProvider>
    )
  }

  componentDidUpdate(prevProps: NaviProps<Context>) {
    if (shallowDiffers(prevProps.context || {}, this.props.context || {})) {
      this.navigation.setContext(this.props.context! || {})
    }
  }

  componentWillUnmount() {
    // When control returns to react-router, you'll want to clean up the
    // navigation object.
    this.navigation.dispose()
    delete this.navigation
  }
}

// Pulled from react-compat
// https://github.com/developit/preact-compat/blob/7c5de00e7c85e2ffd011bf3af02899b63f699d3a/src/index.js#L349
function shallowDiffers (a, b) {
  for (let i in a) if (!(i in b)) return true
  for (let i in b) if (a[i] !== b[i]) return true
  return false
}
