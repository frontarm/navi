import { History } from 'history'
import { Router, RouterResolveOptions } from './Router'
import { Route, routeReducer } from './Route'
import { resolve } from './resolve'
import {
  URLDescriptor,
  areURLDescriptorsEqual,
  createURLDescriptor,
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

export const NAVI_STATES_KEY = '\0navi'

export interface NaviState {
  method?: string,
  body?: string,
  headers?: { [name: string]: string },
  effects?: { [name: string]: string }, 
  key?: number
}

export type NaviStates = NaviState[]

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
  private _history: History

  // Stores the last receive location, even if we haven't processed it.
  // Used to detect and defuse loops where a change to history results
  // in a new change to history before the previous one completes.
  private lastReceivedURL?: URLDescriptor

  private basename?: string
  private matcher: Matcher<Context>

  private waitUntilSteadyDeferred?: Deferred<Route>
  private observers: Observer<Route>[]
  private lastURL?: URLDescriptor
  private lastRoute?: Route
  private ignoreNextURLChange?: boolean
  private isLastRouteSteady: boolean
  private observableSubscription?: Subscription
  private unlisten: () => void
  private nextStateKey: number
  private trailingSlash: 'add' | 'remove' | null

  constructor(options: NavigationOptions<Context>) {
    this._history = options.history
    this.observers = []
    this.isLastRouteSteady = false
    this.basename = options.basename
    this.matcher = options.routes
    this.nextStateKey = 1
    this._router = new Router({
      context: options.context,
      routes: options.routes,
      basename: options.basename,
    })
    this.trailingSlash = options.trailingSlash === undefined ? 'remove' : options.trailingSlash
    this.unlisten = this._history.listen(location =>
      this.handleURLChange(createURLDescriptor(location), false),
    )
  }

  get history() {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Deprecation Warning: "navigation.history" will be removed in Navi 0.13. Please use "navigation.navigate()", "navigation.goBack()" or "navigation.goForward()" instead.`)
    }
    return this._history
  }

  get router() {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Deprecation Warning: "navigation.router" will be removed in Navi 0.13. Please import and use the "resolve()" or "crawl()" functions instead.`)
    }
    return this._router
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
    let nextLocation: URLDescriptor
    if (typeof url === 'string') {
      nextLocation = createURLDescriptor(url)
    } else if ((url as NavigateOptions).url) {
      options = url as NavigateOptions
      nextLocation = createURLDescriptor((options as NavigateOptions).url)
    } else if (url) {
      nextLocation = createURLDescriptor(url as Partial<URLDescriptor>)
    } else {
      throw new Error(`You must specify a URL for navigation.navigate().`)
    }

    let currentLocation = this._history.location
    let shouldReplace =
      options.replace ||
      (options.replace !== false &&
        currentLocation.pathname === nextLocation.pathname &&
        currentLocation.search === nextLocation.search &&
        currentLocation.hash === nextLocation.hash)

    let previousNaviStates = shouldReplace ? this.extract(currentLocation) : []
    let naviState: NaviState = {}

    // TODO: only add a NaviState to the state if there is anything unusual in this
    // navigation or previous ones at the same location, as otherwise we'll have
    // trouble skipping updates to hashes.
    if (options.method || options.headers || options.body || previousNaviStates.length) {
      naviState = {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: JSON.stringify(options.body),
        effects: {},
        key: this.nextStateKey++,
      }
    }

    let naviStates = [naviState].concat(previousNaviStates)
    nextLocation = {
      ...nextLocation,
      state: {
        ...nextLocation.state,
        [NAVI_STATES_KEY]: naviStates,
      },
    }
    
    this._history[shouldReplace ? 'replace' : 'push'](nextLocation)

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
    this.handleURLChange(createURLDescriptor(this._history.location), true)
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
      console.warn('Deprecation Warning: "navigation.getSteadyValue()" will be removed in Navi 0.13. Please use navigation.getRoute() instead.')
    }

    return this.getRoute()
  }

  async steady() {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Deprecation Warning: "navigation.steady()" will be removed in Navi 0.13. Please use navigation.getRoute() instead.')
    }

    await this.getRoute()
  }

  extract(location?): NaviStates {
    if (!location) {
      location = this._history.location
    }
    let state = location.state || { [NAVI_STATES_KEY]: undefined }
    return state[NAVI_STATES_KEY] || []
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

  private handleURLChange(
    url: URLDescriptor,
    force?: boolean,
  ) {
    if (this.ignoreNextURLChange) {
      this.ignoreNextURLChange = false
      return
    }

    // Bail without change is the URL hasn't changed
    if (
      !force &&
      this.lastReceivedURL &&
      areURLDescriptorsEqual(this.lastReceivedURL, url)
    ) {
      for (let i = 0; i < this.observers.length; i++) {
        this.observers[i].next(this.lastRoute!)
      }
      return
    }
    this.lastReceivedURL = url

    // Ensure the pathname always has a trailing `/`, so that we don't
    // have multiple URLs referring to the same page.
    if (this.trailingSlash !== null) {
      let hasTrailingSlash = url.pathname.slice(-1) === '/'
      let newPathname: string | undefined
      if (this.trailingSlash === 'add' && !hasTrailingSlash) {
        newPathname = url.pathname + '/'
      }
      else if (this.trailingSlash === 'remove' && hasTrailingSlash) {
        newPathname = url.pathname.slice(0, -1)
      }
      if (newPathname) {
        url = {
          ...url,
          pathname: newPathname,
        }
        this._history.replace(url)
        return
      }
    }

    let lastURL = this.lastURL
    this.lastURL = url
    let naviStates: NaviStates = this.extract(url)
    let naviState = naviStates[0] || { key: undefined }
    let pathHasChanged, searchHasChanged, naviStateHasChanged
    if (url && lastURL) {
      let lastNaviState: NaviState = this.extract(lastURL)[0] || { key: undefined }
      naviStateHasChanged = naviState.key !== lastNaviState.key
      pathHasChanged = url.pathname !== lastURL.pathname
      searchHasChanged = url.search !== lastURL.search
    }

    // We don't want to recompute the route unless something relevant has
    // changed.
    if (
      !force &&
      !(pathHasChanged || searchHasChanged || naviStateHasChanged) &&
      this.lastRoute
    ) {
      if (url.hash !== lastURL!.hash || url.state !== lastURL!.state) {
        this.setRoute(
          routeReducer(this.lastRoute, {
            type: 'url',
            url: url,
          }),
          this.isLastRouteSteady,
        )
      }
      return
    }

    if (this.observableSubscription) {
      this.observableSubscription.unsubscribe()
    }

    let body = naviState.body === undefined ? undefined : JSON.parse(naviState.body)
    let observableOptions: RouterResolveOptions = {
      body,
      method: naviState.method || 'GET',
      headers: naviState.headers || {},
    }

    let observable = this._router.createObservable(url, observableOptions)
    if (observable) {
      this.observableSubscription = observable.subscribe(this.handleChunkList)
    } else if (!lastURL) {
      throw new OutOfRootError(url)
    }
  }

  // Allows for either the location or route or both to be changed at once.
  private handleChunkList = (chunks: Chunk[]) => {
    let isSteady = true
    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i]
      if (chunk.type === 'busy') {
        isSteady = false
      }
      if (chunk.type === 'redirect') {
        let states = this.extract()
        let location = this._history.location
        let newStates: NaviStates | undefined
        if (states.length > 1) {
          this.ignoreNextURLChange = true
          newStates = states.slice(1)
          this._history.replace({
            ...location,
            state: {
              ...location.state,
              [NAVI_STATES_KEY]: newStates,
            }
          })
          this._history.push(chunk.to)
        }
        else {
          this._history.replace(chunk.to)
        }
        return
      }
    }

    this.setRoute(
      [{ type: 'url', url: this.lastURL }]
        .concat(chunks)
        .reduce(routeReducer, undefined as any) as Route,
      isSteady,
    )
  }

  private setRoute(route: Route, isSteady: boolean) {
    if (route !== this.lastRoute) {
      this.lastRoute = route
      this.isLastRouteSteady = isSteady
      
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
