import { createBrowserHistory, History } from 'history'
import { Navigation } from './Navigation'
import { Matcher } from './Matcher'

export interface BrowserNavigationOptions<Context extends object> {
  /**
   * The Matcher that declares your app's pages.
   */
  routes?: Matcher<Context>

  /**
   * If provided, this part of any URLs will be ignored. This is useful
   * for mounting a Navi app in a subdirectory on a domain.
   */
  basename?: string

  /**
   * This will be made available within your matcher through
   * the `env` object passed to any getter functions.
   */
  context?: Context

  /**
   * If you specify a react-router style `history` object, then Navi will
   * use it to interact with the browser history -- allowing for integration
   * with react-router (and other custom behaviors).
   */
  history?: History

  /**
   * Accepts the history.state of the Navigation object used to pre-render
   * the page on the server.
   */
  state?: any

  /**
   * Configures whether a trailing slash will be added or removed. By default,
   * the trailing slash will be removed.
   */
  trailingSlash?: 'add' | 'remove' | null
}

export function createBrowserNavigation<Context extends object>(
  options: BrowserNavigationOptions<Context>,
) {
  // If there's a server state on the window object, use it and then remove
  // it so that it won't be picked up by any nested navigation objects.
  if (
    !options.state &&
    typeof window !== undefined &&
    window['__NAVI_STATE__']
  ) {
    options.state = window['__NAVI_STATE__']
    delete window['__NAVI_STATE__']
  }

  let history = options.history || createBrowserHistory()
  if (options.state) {
    history.replace({
      ...history.location,
      state: options.state,
    })
  }
  let navigation = new Navigation({
    history,
    basename: options.basename,
    context: options.context,
    routes: options.routes!,
    trailingSlash: options.trailingSlash,
  })
  navigation.refresh()
  return navigation
}
