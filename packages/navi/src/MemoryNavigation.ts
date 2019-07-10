import { createMemoryHistory } from 'history'
import { Matcher } from './Matcher'
import { Navigation, NavigateOptions } from './Navigation'
import { URLDescriptor } from './URLTools'

export interface MemoryNavigationOptions<Context extends object> {
  /**
   * The Matcher that declares your app's pages.
   */
  routes?: Matcher<Context>

  /**
   * The initial URL to match.
   */
  url?: string | Partial<URLDescriptor>
  request?: NavigateOptions

  /**
   * If provided, this part of any URLs will be ignored. This is useful
   * for mounting a Navi app in a subdirectory on a domain.
   */
  basename?: string

  /**
   * This will be made available within your matcher through
   * the second argument passed to any getter functions.
   */
  context?: Context

  /**
   * Configures whether a trailing slash will be added or removed. By default,
   * the trailing slash will be removed.
   */
  trailingSlash?: 'add' | 'remove' | null
}

export function createMemoryNavigation<Context extends object>(
  options: MemoryNavigationOptions<Context>,
) {
  let url = options.url || (options.request && options.request.url)

  if (!url) {
    throw new Error(`createMemoryNavigation() could not find a URL.`)
  }

  let history = createMemoryHistory({
    // The initial entry is ignored, and replaced during the call
    // to navigate below.
    initialEntries: ['/'],
  })

  let navigation = new Navigation({
    history,
    basename: options.basename,
    context: options.context,
    routes: options.routes!,
    trailingSlash: options.trailingSlash,
  })
  navigation.navigate({
    ...options.request,
    url,
    replace: true,
  })
  return navigation
}
