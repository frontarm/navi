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

  private waitUntilSteadyDeferred?: Deferred<R>
  private observers: Observer<R>[]
  private lastURL?: URLDescriptor
  private lastRoute?: R
  private isLastRouteSteady: boolean
  private observableSubscription?: Subscription
  private unlisten: () => void

  // Bodies are stored on a WeakMap instead of in history.state, as
  // history.state must be serializable, and bodies shouldn't have to be.
  private bodies: WeakMap<any, any>

  constructor(options: NavigationOptions<Context, R>) {
    this.reducer =
      options.reducer || ((defaultRouteReducer as any) as Reducer<Chunk, R>)
    this.history = options.history
    this.observers = []
    this.isLastRouteSteady = false
    this.bodies = new WeakMap()
    this.router = new Router({
      context: options.context,
      routes: options.routes,
      basename: options.basename,
      reducer: this.reducer,
    })
    this.unlisten = this.history.listen((location, action) =>
      this.handleURLChange(
        createURLDescriptor(location),
        false,
        action === 'POP',
      ),
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
    delete this.history
    delete this.router
  }

  navigate(
    url: string | Partial<URLDescriptor>,
    options?: NavigateOptionsWithoutURL,
  )
  navigate(url: NavigateOptions)
  navigate(
    url: string | Partial<URLDescriptor> | NavigateOptions,
    options: NavigateOptionsWithoutURL = {},
  ) {
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
      let naviState = {
        method: options.method,
        headers: options.headers,
      }

      this.bodies.set(naviState, options.body)

      nextLocation = {
        ...nextLocation,
        state: {
          ...nextLocation.state,
          _navi: naviState,
        },
      }
    } else if (nextLocation.state) {
      delete nextLocation.state['_navi']
    }

    let currentLocation = this.history.location
    let shouldReplace =
      options.replace ||
      (options.replace !== false &&
        currentLocation.pathname === nextLocation.pathname &&
        currentLocation.search === nextLocation.search &&
        currentLocation.hash === nextLocation.hash)

    this.history[shouldReplace ? 'replace' : 'push'](nextLocation)
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
    forceGet: boolean = true,
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
    let naviState = url.state && url.state['_navi']
    let pathHasChanged, searchHasChanged, naviStateHasChanged
    if (url && lastURL) {
      pathHasChanged = url.pathname !== lastURL.pathname
      searchHasChanged = url.search !== lastURL.search
      naviStateHasChanged =
        naviState !== (lastURL.state && lastURL.state['_navi'])
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

    let observableOptions: RouterResolveOptions = {}
    if (naviState) {
      let body = this.bodies.get(naviState)
      this.bodies.delete(naviState)
      observableOptions = {
        body,
        method: forceGet || !naviState.method ? 'GET' : naviState.method,
        originalMethod: forceGet && naviState.method,
        headers: naviState.headers,
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
      if (isSteady && this.waitUntilSteadyDeferred) {
        this.waitUntilSteadyDeferred.resolve(route)
        delete this.waitUntilSteadyDeferred
      }
      for (let i = 0; i < this.observers.length; i++) {
        this.observers[i].next(route)
      }
    }
  }
}
