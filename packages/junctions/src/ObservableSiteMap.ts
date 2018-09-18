import { Location } from './Location'
import { Junction } from './Junction'
import { AbsoluteMapping } from './Mapping'
import { Observable, Observer, SimpleSubscription } from './Observable'
import { Resolver } from './Resolver'
import { JunctionRoute, SiteMap } from './Route'

export interface ObservableSiteMapOptions<RootJunction extends Junction=any> {
  followRedirects?: boolean,
  maxDepth?: number,
  predicate?: (route: JunctionRoute<RootJunction>) => boolean,
}

export class ObservableSiteMap<RootJunction extends Junction=any> implements Observable<SiteMap<RootJunction>> {
  matcher: RootJunction['prototype']
  resolver: Resolver<any>

  constructor(matcher: RootJunction['prototype'], resolver: Resolver<any>) {
      this.matcher = matcher
      this.resolver = resolver
  }

  subscribe(
      onNextOrObserver: Observer<SiteMap<RootJunction>> | ((value: SiteMap<RootJunction>) => void),
      onError?: (error: any) => void,
      onComplete?: () => void
  ): SimpleSubscription {
      // Set depth to 0
      // Create a queue of locations to map, starting with the one passed in
      // For each route on queue, create a matcher and check terminus of the route
      // If the terminus is a junction, add its children to the map
      // If the terminus is a redirect *that is resolved* then either ignore it or
      //   add its locatino to the queue, depending on the followRedirects option
      // If the terminus is a page, add the route to the map

      // For each location that we encounter:
      // - check the matchers map for that location. if it exists, use the existing matcher
      // - add all used resolvables to set
      // - at the end of each pass, remove any unvisited matchers from the matchers map and
      //   register the used resolvables with our resolver listener 


      return <any>undefined
  }

  getValue(): SiteMap<RootJunction> {
      return <any>undefined
  }
}