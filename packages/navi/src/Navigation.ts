import { History, Location } from 'history'
import { Router, RouterResolveOptions } from './Router'
import { Route, routeReducer } from './Route'
import { resolve } from './resolve'
import {
  URLDescriptor,
  createURLDescriptor,
  modifyTrailingSlash,
} from './URLTools'
import {
  Observer,
  Observable,
  Subscription,
  SimpleSubscription,
  createOrPassthroughObserver,
} from './Observable'
import { Matcher } from './Matcher'
import { Chunk } from './Chunks'
import { OutOfRootError } from './Errors'
import { Deferred } from './Deferred'

// Keep track of the number of navigations since the last steady route,
// so we can detect and bail out of navigation loops.
const MAX_NAVIGATIONS_SINCE_STEADY = 100

export interface NavigationOptions<Context extends object> {
  /**
   * The Matcher that declares your app's pages.
   */
  routes: Matcher<Context>

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
   * You can manually supply a history object. This is useful for
   * integration with react-router.
   *
   * By default, a browser history object will be created.
   */
  history: History

  /**
   * Configures whether a trailing slash will be added or removed. By default,
   * the trailing slash will be removed.
   */
  trailingSlash?: 'add' | 'remove' | null
}

export interface NavigateOptionsWithoutURL {
  body?: any
  headers?: { [name: string]: string }
  method?: string
  state?: any

  /**
   * Whether to replace the current history entry.
   */
  replace?: boolean
}

export interface NavigateOptions extends NavigateOptionsWithoutURL {
  url: string | Partial<URLDescriptor>
}

export class Navigation<Context extends object = any>
  implements Observable<Route> {
  private _router: Router<Context>

  _history: History

  // Stores the last receive location, even if we haven't processed it.
  private lastHandledLocation?: Location

  private navigationsSinceSteady: number
  private basename?: string
  private matcher: Matcher<Context>
  private waitUntilSteadyDeferred?: Deferred<Route>
  private observers: Observer<Route>[]
  private lastRoute?: Route
  private ignoreNextLocationChange?: boolean
  private isLastRouteSteady: boolean
  private observableSubscription?: Subscription
  private unlisten: () => void
  private trailingSlash: 'add' | 'remove' | null

  constructor(options: NavigationOptions<Context>) {
    this._history = options.history
    this.observers = []
    this.isLastRouteSteady = false
    this.navigationsSinceSteady = 0
    this.basename = options.basename
    this.matcher = options.routes
    this._router = new Router({
      context: options.context,
      routes: options.routes,
      basename: options.basename,
    })
    this.trailingSlash =
      options.trailingSlash === undefined ? 'remove' : options.trailingSlash
    this.unlisten = this._history.listen(location =>
      this.handleLocationChange(location, false),
    )
    this.navigate = this.navigate.bind(this)
  }

  dispose() {
    this.observers.length = 0
    this.unlisten()
    delete this.unlisten
    delete this._history

    if (this.observableSubscription) {
      this.observableSubscription.unsubscribe()
    }
    delete this.observableSubscription

    delete this._router
    delete this.waitUntilSteadyDeferred
    delete this.lastRoute
    delete this._router
  }

  async go(n: number) {
    let urlChanged = new Promise(resolve => {
      let unlisten = this._history.listen(() => {
        unlisten()
        resolve()
      })
    })
    this._history.go(n)
    await urlChanged
    return this.getRoute()
  }

  goBack() {
    return this.go(-1)
  }

  goForward() {
    return this.go(1)
  }

  navigate(
    url: string | Partial<URLDescriptor>,
    options?: NavigateOptionsWithoutURL,
  ): Promise<Route>
  navigate(url: NavigateOptions): Promise<Route>
  navigate(
    url: string | Partial<URLDescriptor> | NavigateOptions,
    options: NavigateOptionsWithoutURL = {},
  ): Promise<Route> {
    let nextURL: URLDescriptor
    if (typeof url === 'string') {
      nextURL = createURLDescriptor(url)
    } else if ((url as NavigateOptions).url) {
      options = url as NavigateOptions
      nextURL = createURLDescriptor((options as NavigateOptions).url)
    } else if (url) {
      nextURL = createURLDescriptor(url as Partial<URLDescriptor>)
    } else {
      throw new Error(
        `You must specify a URL or state to navigation.navigate().`,
      )
    }

    let currentLocation = this._history.location

    // Default to replace when we're not changing the URL itself, but only
    // changing state.
    let shouldReplace =
      options.replace ||
      (options.replace !== false &&
        currentLocation.pathname === nextURL.pathname &&
        currentLocation.search === nextURL.search &&
        currentLocation.hash === nextURL.hash)

    this._history[shouldReplace ? 'replace' : 'push']({
      pathname: nextURL.pathname,
      search: nextURL.search,
      hash: nextURL.hash,
      state: packLocationState({
        revertTo: shouldReplace ? currentLocation.state : undefined,
        method: options.method,
        headers: options.headers,
        body: options.body,
        state: options.state,
      }),
    })

    return this.getRoute()
  }

  // TODO:
  // Put any history state on a "prefetched state" object, so that on
  // navigation, any prefetched state can be reused.
  async prefetch(url: string | Partial<URLDescriptor>): Promise<void> {
    await resolve({
      basename: this.basename,
      routes: this.matcher,
      context: this._router.context,
      url,
    })
  }

  refresh(): Promise<Route> {
    this.handleLocationChange(this._history.location, true)
    return this.getRoute()
  }

  setContext(context: Context): Promise<Route> {
    this._router.setContext(context)
    return this.refresh()
  }

  /**
   * Get the latest Route object, regardless of whether it is loading.
   *
   * This is named as `getCurrentValue()` so that Navigation objects can be
   * used with React's `createSubscription()`, and other tools that follow
   * the same specification.
   */
  getCurrentValue(): Route {
    return this.lastRoute!
  }

  /**
   * If loading, returns a promise to the non-busy route. Otherwise, returns
   * the current route.
   */
  async getRoute(): Promise<Route> {
    if (this.isLastRouteSteady) {
      return this.lastRoute!
    } else if (!this.waitUntilSteadyDeferred) {
      this.waitUntilSteadyDeferred = new Deferred()
    }
    return this.waitUntilSteadyDeferred.promise
  }

  /**
   * Returns a promise that resolves once the route is steady.
   * This is useful for implementing static rendering, or for waiting until
   * view is loaded before making the first render.
   */
  async getSteadyValue(): Promise<Route> {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Deprecation Warning: "navigation.getSteadyValue()" will be removed in Navi 0.13. Please use navigation.getRoute() instead.',
      )
    }

    return this.getRoute()
  }

  async steady() {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Deprecation Warning: "navigation.steady()" will be removed in Navi 0.13. Please use navigation.getRoute() instead.',
      )
    }

    await this.getRoute()
  }

  /**
   * Returns the current history state
   */
  extractState(): any {
    return this._history.location.state
  }

  /**
   * If you're using code splitting, you'll need to subscribe to changes to
   * Route, as the route may change as new code chunks are received.
   */
  subscribe(
    onNextOrObserver: Observer<Route> | ((value: Route) => void),
    onError?: (error: any) => void,
    onComplete?: () => void,
  ): SimpleSubscription {
    let observer = createOrPassthroughObserver(
      onNextOrObserver,
      onError,
      onComplete,
    )
    this.observers.push(observer)
    return new SimpleSubscription(this.handleUnsubscribe, observer)
  }

  private handleUnsubscribe = (observer: Observer<Route>) => {
    let index = this.observers.indexOf(observer)
    if (index !== -1) {
      this.observers.splice(index, 1)
    }
  }

  private handleLocationChange(location: Location, force?: boolean) {
    if (this.ignoreNextLocationChange) {
      this.ignoreNextLocationChange = false
      return
    }

    if (++this.navigationsSinceSteady > MAX_NAVIGATIONS_SINCE_STEADY) {
      console.error(
        `Detected possible navigation loop with ${MAX_NAVIGATIONS_SINCE_STEADY} navigations between steady routes. Bailing.`,
      )
      return
    }

    // Ensure the pathname always has a trailing `/`, so that we don't
    // have multiple URLs referring to the same page.
    if (this.trailingSlash !== null) {
      let modifiedPathname = modifyTrailingSlash(
        location.pathname,
        this.trailingSlash,
      )
      if (location.pathname !== modifiedPathname) {
        this._history.replace({
          ...location,
          pathname: modifiedPathname,
        })
        return
      }
    }

    let url = createURLDescriptor(location)
    let lastHandledLocation = this.lastHandledLocation
    this.lastHandledLocation = location
    if (this.observableSubscription) {
      this.observableSubscription.unsubscribe()
    }
    let observable = this._router.createObservable(
      url,
      unpackLocationState(location.state),
    )
    if (observable) {
      this.observableSubscription = observable.subscribe(this.handleChunkList)
    } else if (!lastHandledLocation) {
      throw new OutOfRootError(url)
    }
  }

  // Allows for either the location or route or both to be changed at once.
  private handleChunkList = (chunks: Chunk[]) => {
    let isSteady = true
    let location = this._history.location
    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i]
      if (chunk.type === 'busy') {
        isSteady = false
      }
      if (chunk.type === 'state') {
        this.ignoreNextLocationChange = true
        this._history.replace({
          ...location,
          state: setLocationRequestState(location.state, chunk.state),
        })
      }
      if (chunk.type === 'redirect') {
        let revertedState = revertLocationState(location.state)
        if (revertedState) {
          this.ignoreNextLocationChange = true
          this._history.replace({
            ...location,
            state: revertedState,
          })
          this._history.push(chunk.to)
        } else {
          this._history.replace(chunk.to)
        }
        return
      }
    }

    this.setRoute(
      [{ type: 'url', url: createURLDescriptor(this.lastHandledLocation!) }]
        .concat(chunks)
        .reduce(routeReducer, undefined as any) as Route,
      isSteady,
    )
  }

  private setRoute(route: Route, isSteady: boolean) {
    if (route !== this.lastRoute) {
      this.lastRoute = route
      this.isLastRouteSteady = isSteady

      if (isSteady) {
        this.navigationsSinceSteady = 0
      }

      for (let i = 0; i < this.observers.length; i++) {
        this.observers[i].next(route)
      }

      // Check this.isLastRouteSteady instead of isSteady, in case one of our
      // subscribers causes navigation again.
      if (this.isLastRouteSteady && this.waitUntilSteadyDeferred) {
        this.waitUntilSteadyDeferred.resolve(route)
        delete this.waitUntilSteadyDeferred
      }
    }
  }
}

const NAVI_STATE_KEY = '__navi__'

interface RequestDataWithoutState {
  method?: string
  body?: string
  headers?: { [name: string]: string }
}

interface RequestData extends RequestDataWithoutState {
  // The current `request.state` is stored directly on `window.history.state`.
  state?: any
}

interface NaviState {
  requestDataWithoutState?: RequestDataWithoutState
  revertTo?: any
}

interface PackLocationStateOptions extends RequestData {
  revertTo?: any
}

/**
 * Set the value of request.state without changing the other request data.
 */
function setLocationRequestState(locationState: any = {}, newState: any): any {
  return {
    ...newState,
    [NAVI_STATE_KEY]: locationState[NAVI_STATE_KEY],
  }
}

function packLocationState({
  revertTo,
  state,
  ...requestDataWithoutState
}: PackLocationStateOptions): any {
  if (revertTo) {
    revertTo = { ...revertTo }
    if (revertTo[NAVI_STATE_KEY]) {
      delete revertTo[NAVI_STATE_KEY].revertTo
    }
  }
  return {
    ...state,
    [NAVI_STATE_KEY]: {
      requestDataWithoutState,
      revertTo,
    },
  }
}

function unpackLocationState(state: any = {}): RequestData {
  let requestDataState = { ...state }
  delete requestDataState[NAVI_STATE_KEY]
  let naviState: NaviState = state[NAVI_STATE_KEY] || {}
  return {
    ...naviState.requestDataWithoutState,
    state: Object.keys(requestDataState).length ? requestDataState : undefined,
  }
}

function revertLocationState(state: any = {}): any {
  let naviState: NaviState = state[NAVI_STATE_KEY] || {}
  return naviState.revertTo
}
