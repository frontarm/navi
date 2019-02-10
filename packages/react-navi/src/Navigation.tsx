import * as React from 'react'
import { BrowserNavigation, Route, Matcher, createBrowserNavigation } from 'navi'
import { NavProvider, NavProviderProps } from './NavProvider'
import { NavView, NavViewProps } from './NavView'

export interface NavigationProps<Context extends object> extends NavViewProps {
  context?: Context

  /**
   * Navi will attempt to detect a non browser environment in order to
   * prevent rendering of <Suspense>, but if it fails, you can manually
   * set `fallback` to `undefined`.
   */
  fallback?: React.ReactNode | undefined

  routes?: Matcher<Context>
}

export class Navigation<Context extends object={}> extends React.Component<NavigationProps<Context>> {
  static defaultProps = {
    fallback: undefined,
  }

  navigation: BrowserNavigation<Context, Route>

  constructor(props: NavigationProps<Context>) {
    super(props)
    this.navigation = createBrowserNavigation({
      context: props.context,
      routes: props.routes,
    })
  }

  render() {
    let { fallback, routes, ...viewProps } = this.props
    return (
      <NavProvider fallback={fallback} navigation={this.navigation}>
        <NavView {...viewProps} />
      </NavProvider>
    )
  }

  componentDidUpdate(prevProps: NavigationProps<Context>) {
    if (shallowDiffers(prevProps.context || {}, this.props.context || {})) {
      this.navigation.setContext(this.props.context! || {})
    }
  }
}

// Pulled from react-compat
// https://github.com/developit/preact-compat/blob/7c5de00e7c85e2ffd011bf3af02899b63f699d3a/src/index.js#L349
function shallowDiffers (a, b) {
  for (let i in a) if (!(i in b)) return true
  for (let i in b) if (a[i] !== b[i]) return true
  return false
}
