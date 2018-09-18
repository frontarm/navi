import { Location } from './Location'
import { Junction } from './Junction'
import { AbsoluteMapping } from './Mapping'
import { Observable, Observer, SimpleSubscription } from './Observable'
import { Resolver } from './Resolver'
import { JunctionRoute } from './Route'

export interface ObservableRouteOptions {
  withContent?: boolean
}

export class ObservableRoute<RootJunction extends Junction=any> implements Observable<JunctionRoute<RootJunction>> {
  private matcher: RootJunction['prototype']
  private observers: Observer<JunctionRoute<RootJunction>>[]
  private resolver: Resolver<any>
  
  constructor(
      location: Location,
      rootJunction: RootJunction,
      rootMapping: AbsoluteMapping,
      resolver: Resolver,
      options: ObservableRouteOptions
  ) {
      this.matcher = new rootJunction({
          matchableLocation: location,
          mapping: rootMapping,
          resolver: this.resolver,
          withContent: !!options.withContent,
      })
      this.observers = []
      this.resolver = resolver
  }

  subscribe(
      onNextOrObserver: Observer<JunctionRoute<RootJunction>> | ((value: JunctionRoute<RootJunction>) => void),
      onError?: (error: any) => void,
      onComplete?: () => void
  ): SimpleSubscription {
      let { resolvables } = this.matcher.execute()

      // This will replace any existing listener and its associated resolvables
      this.resolver.listen(this.handleChange, resolvables!)

      let observer: Observer<JunctionRoute<RootJunction>> = 
          typeof onNextOrObserver === 'function'
              ? {
                  next: onNextOrObserver,
                  error: onError,
                  complete: onComplete,
              }
              : onNextOrObserver

      this.observers.push(observer)

      return new SimpleSubscription(this.handleUnsubscribe, observer)
  }

  getValue(): JunctionRoute<RootJunction> {
      // We don't need to worry about any subscriptions here
      return this.matcher.execute().route!
  }

  private handleUnsubscribe = (observer: Observer<JunctionRoute<RootJunction>>) => {
      let index = this.observers.indexOf(observer)
      if (index !== -1) {
          this.observers.splice(index, 1)
      }
      if (this.observers.length === 0) {
          this.resolver.unlisten(this.handleChange)
      }
  }

  private handleChange = () => {
      let { route, resolvables } = this.matcher.execute()

      // This will replace any existing listener and its associated resolvables
      this.resolver.listen(this.handleChange, resolvables!)

      for (let i = 0; i < this.observers.length; i++) {
          this.observers[i].next(route!)
      }
  }
}
