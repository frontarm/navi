import { History } from 'history'
import { Router } from './Router'
import { Route, defaultRouteReducer } from './Route'
import { Observable } from './Observable'
import { URLDescriptor } from './URLTools'
import { Observer, SimpleSubscription, createOrPassthroughObserver } from './Observable'
import { Matcher } from './Matcher'
import { CurrentRouteObservable } from './CurrentRouteObservable'
import { Reducer } from './Reducer'
import { Chunk } from './Chunks'

export interface NavigationOptions<Context extends object, R = Route> {
  /**
   * The Matcher that declares your app's pages.
   */
  routes: Matcher<Context>,

  /**
   * If provided, this part of any URLs will be ignored. This is useful
   * for mounting a Navi app in a subdirectory on a domain.
   */
  basename?: string,

  /**
   * This will be made available within your matcher through
   * the second argument passed to any getter functions.
   */
  context?: Context,

  /**
   * The function that reduces chunks into a Route object.
   */
  reducer?: Reducer<Chunk, R>,

  /**
   * You can manually supply a history object. This is useful for
   * integration with react-router.
   * 
   * By default, a browser history object will be created.
   */
  history: History,
}

export interface NavigateOptionsWithoutURL {
  headers?: { [name: string]: string },
  method?: string,
  body?: any,

  /**
   * Whether to replace the current history entry.
   */
  replace?: boolean,
}

export interface NavigateOptions extends NavigateOptionsWithoutURL {
  url: string | Partial<URLDescriptor>,
}

export class Navigation<Context extends object=any, R=Route> implements Observable<R> {
  router: Router<Context, R>

  readonly history: History

  private currentRouteObservable: CurrentRouteObservable<Context, R>

  constructor(options: NavigationOptions<Context, R>) {
    let reducer = options.reducer || defaultRouteReducer as any as Reducer<Chunk, R>
    
    this.history = options.history
    this.router = new Router({
        context: options.context,
        routes: options.routes,
        basename: options.basename,
        reducer,
    })
    this.currentRouteObservable = new CurrentRouteObservable(
        this.history,
        this.router,
        reducer,
    )
  }

  dispose() {
    this.currentRouteObservable.dispose()
    delete this.currentRouteObservable
    delete this.router
  }

  // navigate(url: string | Partial<URLDescriptor>, options?: NavigateOptionsWithoutURL);
  // navigate(url: NavigateOptions);

  setContext(context: Context) {
    this.currentRouteObservable.setContext(context)
  }

  getCurrentValue(): R {
    return this.currentRouteObservable.getValue()
  }

  getSteadyValue(): Promise<R> {
    return this.currentRouteObservable.getSteadyRoute()
  }

  async steady() {
    await this.getSteadyValue()
    return
  }

  /**
   * If you're using code splitting, you'll need to subscribe to changes to
   * the snapshot, as the route may change as new code chunks are received.
   */
  subscribe(
    onNextOrObserver: Observer<R> | ((value: R) => void),
    onError?: (error: any) => void,
    onComplete?: () => void
  ): SimpleSubscription {
    let navigationObserver = createOrPassthroughObserver(onNextOrObserver, onError, onComplete)
    return this.currentRouteObservable.subscribe(navigationObserver)
  }
}
