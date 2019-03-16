import { Chunk, createChunk, createNotFoundChunk } from '../Chunks'
import { createMapping, matchAgainstPathname, Mapping } from '../Mapping'
import { Matcher, MatcherIterator, createMatcherIterator } from '../Matcher'
import { NaviRequest } from '../NaviRequest'
import { Crawler, CrawlItem } from '../Crawler'

export function mount<
  Context extends object,
  Contexts extends { [P in Patterns]: object } = any,
  Patterns extends string = string
>(paths: {
  [P in Patterns]: Matcher<Context extends Contexts[P] ? Contexts[P] : {}>
}): Matcher<Context> {
  if (!paths) {
    throw new Error(`mount() must be supplied with a paths object.`)
  }

  let patterns = Object.keys(paths)

  if (process.env.NODE_ENV !== 'production') {
    let invalidPaths = patterns.filter(
      pattern => typeof paths[pattern] !== 'function',
    )
    if (invalidPaths.length > 0) {
      throw new TypeError(
        `The given paths: ${invalidPaths.join(', ')} are invalid. ` +
          `Their values should be matcher objects. See https://frontarm.com/navi/en/reference/matchers/`,
      )
    }
  }

  // Wildcards in PatternMap objects are null (\0) characters, so they'll
  // always be sorted to the top. As such, by sorting the patterns, the
  // most specific (i.e. without wildcard) will always be at the bottom.
  let mappings = patterns
    .map(pattern => createMapping(pattern, paths[pattern]))
    .sort((x, y) => compareStrings(x.key, y.key))

  return () =>
    function* mountMatcherGenerator(
      request: NaviRequest<Context>,
      crawler: null | Crawler,
    ): MatcherIterator {
      let chunks: Chunk[]
      let childIterators: MatcherIterator[] | undefined
      let childResults: IteratorResult<Chunk[]>[] = []
      let childChunkLists: Chunk[][] = []
      let crawlRequests: NaviRequest[] = []
      let crawling = crawler && (request.path === '' || request.path === '/')

      // When crawling, if there, is no unmatched path remaining, then
      // create requests for all mappings, and calls those matchers.
      if (crawling) {
        let crawlTuplesPromise  = createCrawlTuplesPromise(mappings, crawler!, request)
        let crawlTuples: CrawlTuple[] | undefined
        let error
        crawlTuplesPromise.then(
          x => { crawlTuples = x },
          y => error = y
        )
        do {
          yield [createChunk('busy', request, { promise: crawlTuplesPromise })]
          if (error) {
            throw error
          }
        } while (!crawlTuples)
        childIterators = crawlTuples.map(([mapping, crawlItem], i) => {
          let crawlRequest: NaviRequest = {
            ...request,
            mountpath: crawlItem.url.pathname,
            url: '',
            path: '',
          }
          crawlRequests[i] = crawlRequest
          return createMatcherIterator(mapping.matcher(), crawlRequest, crawler, crawlRequest.mountpath)
        })
      }
      else {
        // Start from the beginning and take the first result, as child mounts
        // are sorted such that the first matching mount is the the most
        // precise match (and we always want to use the most precise match).
        for (let i = mappings.length - 1; i >= 0; i--) {
          let mapping = mappings[i]
          let childRequest = matchAgainstPathname(request, mapping)
          if (childRequest) {
            childIterators = [createMatcherIterator(mapping.matcher(), childRequest, crawler, mapping.pattern)]

            // The first match is always the only match, as we don't allow
            // for ambiguous patterns.
            break
          }
        }
      }

      do {
        if (childIterators) {
          for (let i = 0; i < childIterators.length; i++) {
            let childResult = childResults[i]
            if (!childResult || !childResult.done) {
              childResult = childResults[i] = childIterators[i].next()
            }
            if (childResult && !childResult.done) {
              childChunkLists[i] = childResult.value
            }
          }
        }

        chunks = [createChunk('mount', request, { patterns })]

        let foundChunks = false
        for (let i = 0; i < childResults.length; i++) {
          let childChunks = childChunkLists[i]
          if (childChunks) {
            foundChunks = true
            if (crawling && !childChunks.some(isMountChunk)) {
              chunks = chunks.concat(createChunk('crawl', crawlRequests[i]))
            }
            chunks = chunks.concat(childChunks)
          }
        }
        if (!crawler && !foundChunks) {
          chunks.push(createNotFoundChunk(request))
        }

        yield chunks
      } while (chunks.filter(isBusy).length)
    }
}

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

function isBusy(chunk: Chunk) {
  return chunk.type === 'busy'
}

function concat<T>(args: (T | T[])[]): T[] {
  return [].concat.apply([], args)
}

async function createCrawlTuplesPromise(
  mappings: Mapping[],
  crawler: Crawler,
  parentRequest: NaviRequest
): Promise<CrawlTuple[]> {
  return concat(
    await Promise.all(mappings.map(mapping =>
      crawler!(mapping.pattern, parentRequest).then(createTuplesWith(mapping))
    ))
  )
}

type CrawlTuple = [Mapping, CrawlItem]

function createTuplesWith<X>(x: X): <Y>(ys: Y[]) => [X, Y][] {
  return <Y>(ys: Y[]) => ys.map(y => [x, y] as [X, Y])
}

function isMountChunk(chunk: Chunk): boolean {
  return chunk.type === 'mount'
}