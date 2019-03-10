import { History } from 'history'
import { Router, RouterResolveOptions } from './Router'
import { Route, defaultRouteReducer } from './Route'
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
import { Reducer } from './Reducer'
import { Chunk } from './Chunks'
import { OutOfRootError } from './Errors'
import { Deferred } from './Deferred'

export const NAVI_STATE_KEY = '\0navi'

export interface NaviState {
  method?: string,
  body?: string,
  headers?: { [name: string]: string },
  memos?: { [name: string]: string }, 
  key?: number
}

export interface NavigationOptions<Context extends object, R = Route> {
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
   * The function that reduces chunks into a Route object.
   */
  reducer?: Reducer<Chunk, R>

  /**
   * You can manually supply a history object. This is useful for
   * integration with react-router.
   *
   * By default, a browser history object will be created.
   */
  history: History

  /**
   * When true, the initial HTTP method will be respect, instead of reverting
   * it to "GET".
   */
  respectInitialMethod?: boolean
}

export interface NavigateOptionsWithoutURL {
  headers?: { [name: string]: string }
  method?: string
  body?: any

  /**
   * Whether to replace the current history entry.
   */
  replace?: boolean
}

export interface NavigateOptions extends NavigateOptionsWithoutURL {
  url: string | Partial<URLDescriptor>
}

export class Navigation<Context extends object = any, R = Route>
  implements Observable<R> {
  router: Router<Context, R>
  history: History

  private reducer: Reducer<Chunk, R>

  // Stores the last receive location, even if we haven't processed it.
  // Used to detect and defuse loops where a change to history results
  // in a new change to history before the previous one completes.
  private lastReceivedURL?: URLDescriptor
  private lastHandledURL?: URLDescriptor

  private waitUntilSteadyDeferred?: Deferred<R>
  private observers: Observer<R>[]
  private lastURL?: URLDescriptor
  private lastRoute?: R
  private isLastRouteSteady: boolean
  private observableSubscription?: Subscription
  private unlisten: () => void
  private nextStateKey: number

  constructor(options: NavigationOptions<Context, R>) {
    this.reducer =
      options.reducer || ((defaultRouteReducer as any) as Reducer<Chunk, R>)
    this.history = options.history
    this.observers = []
    this.isLastRouteSteady = false
    this.nextStateKey = 1
    this.router = new Router({
      context: options.context,
      routes: options.routes,
      basename: options.basename,
      reducer: this.reducer,
    })
    this.unlisten = this.history.listen((location, action) =>
      this.handleURLChange(createURLDescriptor(location), false),
    )
  }

  dispose() {
    this.observers.length = 0
    this.unlisten()
    delete this.unlisten
    delete this.history

    if (this.observableSubscription) {
      this.observableSubscription.unsubscribe()
    }
    delete this.observableSubscription

    delete this.router
    delete this.waitUntilSteadyDeferred
    delete this.lastRoute
    delete this.router
  }

  navigate(
    url: string | Partial<URLDescriptor>,
    options?: NavigateOptionsWithoutURL,
  ): Promise<R>
  navigate(url: NavigateOptions): Promise<R>
  navigate(
    url: string | Partial<URLDescriptor> | NavigateOptions,
    options: NavigateOptionsWithoutURL = {},
  ): Promise<R> {
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

    if (options.method || options.headers || options.body) {
      let naviState: NaviState = {
        method: options.method,
        headers: options.headers,
        body: JSON.stringify(options.body),
        memos: {},
        key: this.nextStateKey++,
      }

      nextLocation = {
        ...nextLocation,
        state: {
          ...nextLocation.state,
          [NAVI_STATE_KEY]: naviState,
        },
      }
    } else if (nextLocation.state) {
      delete nextLocation.state[NAVI_STATE_KEY]
    }

    let currentLocation = this.history.location
    let shouldReplace =
      options.replace ||
      (options.replace !== false &&
        currentLocation.pathname === nextLocation.pathname &&
        currentLocation.search === nextLocation.search &&
        currentLocation.hash === nextLocation.hash)

    this.history[shouldReplace ? 'replace' : 'push'](nextLocation)

    return this.getSteadyValue()
  }

  refresh() {
    this.handleURLChange(createURLDescriptor(this.history.location), true)
  }

  setContext(context: Context) {
    this.router.setContext(context)
    this.refresh()
  }

  /**
   * Get the latest route
   */
  getCurrentValue(): R {
    return this.lastRoute!
  }

  /**
   * Returns a promise that resolves once the route is steady.
   * This is useful for implementing static rendering, or for waiting until
   * view is loaded before making the first render.
   */
  async getSteadyValue(): Promise<R> {
    if (this.isLastRouteSteady) {
      return Promise.resolve(this.lastRoute!)
    } else if (!this.waitUntilSteadyDeferred) {
      this.waitUntilSteadyDeferred = new Deferred()
    }
    return this.waitUntilSteadyDeferred.promise
  }

  async steady() {
    await this.getSteadyValue()
  }

  extract(): NaviState {
    let state = this.history.location.state || { [NAVI_STATE_KEY]: undefined }
    return state[NAVI_STATE_KEY] || {}
  }

  /**
   * If you're using code splitting, you'll need to subscribe to changes to
   * Route, as the route may change as new code chunks are received.
   */
  subscribe(
    onNextOrObserver: Observer<R> | ((value: R) => void),
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

  private handleUnsubscribe = (observer: Observer<R>) => {
    let index = this.observers.indexOf(observer)
    if (index !== -1) {
      this.observers.splice(index, 1)
    }
  }

  private handleURLChange(
    url: URLDescriptor,
    force?: boolean,
  ) {
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
    if (url.pathname.substr(-1) !== '/') {
      url = {
        ...url,
        pathname: url.pathname + '/',
      }
      this.history.replace(url)
      return
    }

    let lastURL = this.lastURL
    this.lastURL = url
    let naviState: NaviState = (url.state && url.state[NAVI_STATE_KEY]) || { key: undefined }
    let pathHasChanged, searchHasChanged, naviStateHasChanged
    if (url && lastURL) {
      let lastNaviState: NaviState = lastURL.state && lastURL.state[NAVI_STATE_KEY] || { key: undefined }
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
          this.reducer(this.lastRoute, {
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

    this.lastHandledURL = url

    let body = naviState.body === undefined ? undefined : JSON.parse(naviState.body)
    let memos = naviState.memos || {}
    let keyCounters: { [name: string]: number } = {}
    let observableOptions: RouterResolveOptions = {
      body,
      method: naviState.method || 'GET',
      headers: naviState.headers || {},
      memo: async <T>(callback: () => T | Promise<T>, ...keys: string[]) => {
        let key = keys.join('.')
        let count = keyCounters[key] || 0
        keyCounters[key] = count + 1
        key += '.'+count

        if (key in memos) {
          let serializedValue = memos[key]
          return serializedValue && JSON.parse(serializedValue)
        }

        let value = await callback()

        // Record the memoized value
        memos[key] = JSON.stringify(value)
        if (this.lastHandledURL === url) {
          let location = this.history.location
          this.history.replace({
            ...location,
            state: {
              ...location.state,
              [NAVI_STATE_KEY]: {
                ...naviState,
                memos
              },
            },
          })
        }

        return value
      }
    }

    let observable = this.router.createObservable(url, observableOptions)
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
        this.history.replace(chunk.to)
        return
      }
    }

    this.setRoute(
      [{ type: 'url', url: this.lastURL }]
        .concat(chunks)
        .reduce(this.reducer, undefined as any) as R,
      isSteady,
    )
  }

  private setRoute(route: R, isSteady: boolean) {
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
