import {
  URLDescriptor,
  createURLDescriptor,
  joinPaths,
  modifyTrailingSlash,
} from './URLTools'
import {
  Observable,
  Observer,
  SimpleSubscription,
  createOrPassthroughObserver,
} from './Observable'
import { Chunk, BusyChunk } from './Chunks'
import { MatcherGenerator, MatcherIterator } from './Matcher'
import { RouterMapOptions, Router } from './Router'
import { Mapping, matchAgainstPathname } from './Mapping'

interface MapItem {
  url: URLDescriptor
  pathname: string
  fromPathname?: string
  depth: number
  order: number[]
  matcherIterator: MatcherIterator
  lastResult?: IteratorResult<Chunk[]>
  chunksCache?: Chunk[]
  lastMountPatterns?: string[]
  lastRedirectTo?: string
  walkedPatternLists: Set<string>
}

export interface ChunksMap {
  [name: string]: Chunk[]
}

export class ChunksMapObservable implements Observable<ChunksMap> {
  private rootContext: any
  private matcherGeneratorFunction: MatcherGenerator<any>
  private rootMapping: Mapping
  private observers: Observer<ChunksMap>[]
  private isRefreshScheduled: boolean
  private isRefreshing: boolean
  private router: Router
  private options: RouterMapOptions
  private lastListenId: number

  private seenPathnames: Set<string>
  private mapItems: MapItem[]

  constructor(
    url: URLDescriptor,
    rootContext: any,
    matcherGeneratorClass: MatcherGenerator<any>,
    rootMapping: Mapping,
    router: Router<any>,
    options: RouterMapOptions,
  ) {
    this.observers = []
    this.lastListenId = 0
    this.mapItems = []
    this.router = router
    this.rootContext = rootContext
    this.matcherGeneratorFunction = matcherGeneratorClass
    this.rootMapping = rootMapping
    this.options = options
    this.seenPathnames = new Set()

    let pathname = url.pathname

    // A final '/' always indicates a Page or Redirect, and it
    // doesn't really make sense to build a map of a single page/redirect.
    if (pathname.substr(-1) === '/') {
      pathname = pathname.substr(0, pathname.length - 1)
    }

    this.addToQueue(pathname, 0, new Set())
  }

  subscribe(
    onNextOrObserver: Observer<ChunksMap> | ((value: ChunksMap) => void),
    onError?: (error: any) => void,
    onComplete?: () => void,
  ): SimpleSubscription {
    if (!this.observers) {
      throw new Error(
        "Can't subscribe to an already-complete RoutingObservable.",
      )
    }

    let observer = createOrPassthroughObserver(
      onNextOrObserver,
      onError,
      onComplete,
    )
    this.observers.push(observer)
    let subscription = new SimpleSubscription(this.handleUnsubscribe, observer)
    if (this.observers.length === 1) {
      this.refresh()
    }
    return subscription
  }

  private async expandPatterns(pattern: string) {
    if (this.options.expandPattern) {
      let expandedPatterns = await this.options.expandPattern(
        pattern,
        this.router,
      )
      if (expandedPatterns) {
        return expandedPatterns
      }
    }
    return [pattern].filter(pattern => !/\/:/.test(pattern))
  }

  private handleUnsubscribe = (observer: Observer<ChunksMap>) => {
    let index = this.observers.indexOf(observer)
    if (index !== -1) {
      this.observers.splice(index, 1)
    }
  }

  private handleResolverUpdate = listenId => {
    if (listenId === this.lastListenId) {
      this.lastListenId++
      if (!this.isRefreshing) {
        this.refresh()
      } else if (!this.isRefreshScheduled) {
        this.isRefreshScheduled = true
      }
    }
  }

  private refresh = async () => {
    this.isRefreshScheduled = false
    this.isRefreshing = true

    let allChunks: Chunk[] = []
    let i = 0

    // This is a while loop instead of a for loop, as new items can be added
    // to this.mapItems within the loop body.
    items: while (this.mapItems && i < this.mapItems.length) {
      let item = this.mapItems[i]

      let pathname = item.pathname
      let result = item.matcherIterator.next()
      if (!item.lastResult || result.value) {
        item.lastResult = result
      }
      let chunks = item.lastResult.value
      item.chunksCache = chunks || []
      let focusIndex = chunks.findIndex(
        chunk =>
          chunk.type === 'error' ||
          (chunk.url.href.length >= item.url.href.length &&
            ((chunk.type === 'mount' &&
              item.lastMountPatterns !== chunk.patterns) ||
              (chunk.type === 'redirect' && item.lastRedirectTo !== chunk.to))),
      )

      while (focusIndex >= 0 && focusIndex < chunks.length) {
        let focusChunk = chunks[focusIndex]
        focusIndex++

        // If an item in the map cannot be found, throws an error, or is
        // no longer referenced by other items, then remove it from the
        // map.
        //
        // Note that later items in the map should always be "from" earlier
        // items, so if an earlier item is removed, its referenced items
        // will still be removed.
        if (
          focusChunk.type === 'error' ||
          (this.options.predicate &&
            !this.options.predicate(focusChunk, chunks))
        ) {
          this.removeFromQueue(item)
          continue items
        }

        if (focusChunk.type === 'redirect') {
          item.lastRedirectTo = focusChunk.to
          if (this.options.followRedirects) {
            this.addToQueue(
              focusChunk.to,
              item.depth + 1,
              item.walkedPatternLists,
              pathname,
              item.order,
            )
          }
        }

        if (focusChunk.type === 'mount') {
          let patterns = focusChunk.patterns
          item.lastMountPatterns = patterns
          let key = patterns
            .slice(0)
            .sort()
            .join('\n')
          if (patterns && !item.walkedPatternLists.has(key)) {
            item.walkedPatternLists.add(key)
            for (let j = 0; j < patterns.length; j++) {
              let expandedPatterns = await this.expandPatterns(
                joinPaths(pathname, patterns[j]),
              )
              for (let k = 0; k < expandedPatterns.length; k++) {
                this.addToQueue(
                  expandedPatterns[k],
                  item.depth + 1,
                  item.walkedPatternLists,
                  pathname,
                  item.order.concat(j, k),
                )
              }
            }
          }
        }
      }

      if (chunks) {
        allChunks = allChunks.concat(chunks)
      }

      // Increment at the end of the loop in case the current item has
      // been removed, in which case the index won't change.
      i++
    }

    // It's possible for the map to finish while waiting for expandPatterns to return.
    if (!this.mapItems) {
      return
    }

    let chunksMapArray = [] as [string, Chunk[], number[]][]
    for (let i = 0; i < this.mapItems.length; i++) {
      let item = this.mapItems[i]
      let lastChunk = item.chunksCache![item.chunksCache!.length - 1]
      if (
        lastChunk.type !== 'mount' &&
        lastChunk.type !== 'error' &&
        (lastChunk.type === 'busy' ||
          !this.options.predicate ||
          this.options.predicate(lastChunk, item.chunksCache!))
      ) {
        chunksMapArray.push([
          joinPaths(item.pathname, '/'),
          item.chunksCache!,
          item.order,
        ])
      }
    }

    let listenId = ++this.lastListenId
    let handleUpdate = () => this.handleResolverUpdate(listenId)
    Promise.race(allChunks.filter(isBusy).map(pickChunkPromise)).then(
      handleUpdate,
      handleUpdate,
    )

    chunksMapArray.sort((itemX, itemY) => {
      let x = itemX[2]
      let y = itemY[2]

      if (x.length < y.length) {
        return -1
      }
      if (x.length > y.length) {
        return 1
      }

      for (let i = 0; i < x.length; i++) {
        if (x[i] < y[i]) {
          return -1
        }
        if (x[i] > y[i]) {
          return 1
        }
      }

      return 0
    })

    if (this.isRefreshScheduled) {
      this.refresh()
    } else {
      let chunksMap: ChunksMap = {}
      let isSteady = true
      for (let i = 0; i < chunksMapArray.length; i++) {
        let [pathname, chunks] = chunksMapArray[i]
        if (chunks.some(chunk => chunk.type === 'busy')) {
          isSteady = false
        }
        chunksMap[modifyTrailingSlash(pathname, 'remove')] = chunks
      }

      for (let i = 0; i < this.observers.length; i++) {
        let observer = this.observers[i]
        observer.next(chunksMap)
        if (isSteady && observer.complete) {
          observer.complete()
        }
      }
      if (isSteady) {
        delete this.rootContext
        delete this.mapItems
        delete this.router
        delete this.observers
      }

      this.isRefreshing = false
    }
  }

  private removeFromQueue(item) {
    let i = this.mapItems.indexOf(item)
    if (i !== -1) {
      this.mapItems.splice(i, 1)
    }
  }

  private addToQueue(
    pathname: string,
    depth: number,
    walkedPatternLists: Set<string>,
    fromPathname?: string,
    order = [0],
  ) {
    if (this.seenPathnames.has(pathname)) {
      return
    }

    if (!this.options.maxDepth || depth <= this.options.maxDepth) {
      this.seenPathnames.add(pathname)

      let url = createURLDescriptor(pathname, {
        removeHash: true,
      })
      let request = {
        body: null,
        context: this.rootContext,
        headers: this.options.headers || {},
        method: this.options.method || 'HEAD',
        params: {},
        hostname: this.options.hostname || '',
        mountpath: '',
        query: url.query,
        search: url.search,
        hash: url.hash,
        path: url.pathname,
        url: url.pathname + url.search,
        originalUrl: url.href,
        state: {},
      }
      let matchRequest = matchAgainstPathname(request, this.rootMapping)
      if (matchRequest) {
        this.mapItems.push({
          url,
          fromPathname,
          depth,
          pathname,
          order,
          walkedPatternLists: new Set(walkedPatternLists),
          matcherIterator: this.matcherGeneratorFunction(matchRequest),
        })
      }
    }
  }
}

function isBusy(chunk: Chunk): chunk is BusyChunk {
  return chunk.type === 'busy'
}

function pickChunkPromise(chunk: BusyChunk): PromiseLike<any> {
  return chunk.promise
}
