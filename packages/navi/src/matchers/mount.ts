import { Chunk, createChunk, createNotFoundChunk } from '../Chunks'
import { createMapping, mappingAgainstPathname } from '../Mapping'
import { Matcher, MatcherIterator } from '../Matcher'
import { NaviRequest } from '../NaviRequest'

export type MountPaths<Context extends object> = {
  [pattern: string]: Matcher<Context>
}

export function mount<Context extends object>(
  paths: MountPaths<Context>,
): Matcher<Context> {
  if (!paths) {
    throw new Error(`mount() must be supplied with a paths object.`)
  }

  let patterns = Object.keys(paths)
  let invalidPaths = patterns.filter(
    pattern => typeof paths[pattern] !== 'function',
  )
  if (invalidPaths.length > 0) {
    throw new TypeError(
      `The given paths: ${invalidPaths.join(', ')} are invalid. ` +
        `Their values should be matcher objects. See https://frontarm.com/navi/reference/matchers/`,
    )
  }

  // Wildcards in PatternMap objects are null (\0) characters, so they'll
  // always be sorted to the top. As such, by sorting the patterns, the
  // most specific (i.e. without wildcard) will always be at the bottom.
  let mappings = patterns
    .map(pattern => createMapping(pattern, paths[pattern]))
    .sort((x, y) => compareStrings(x.key, y.key))

  return () =>
    function* mountMatcherGenerator(
      request: NaviRequest,
      context: Context
    ): MatcherIterator {
      let chunks: Chunk[]
      let childIterator: MatcherIterator | undefined
      let childResult: IteratorResult<Chunk[]> | undefined

      // Start from the beginning and take the first result, as child mounts
      // are sorted such that the first matching mount is the the most
      // precise match (and we always want to use the most precise match).
      for (let i = mappings.length - 1; i >= 0; i--) {
        let mapping = mappings[i]
        let childRequest = mappingAgainstPathname(request, mapping, context)
        if (childRequest) {
          childIterator = mapping.matcher()(childRequest, context)

          // The first match is always the only match, as we don't allow
          // for ambiguous patterns.
          break
        }
      }

      do {
        if (childIterator && (!childResult || !childResult.done)) {
          childResult = childIterator.next()
        }

        chunks = [createChunk('mount', request, { patterns }, false)]

        let childChunks = childResult && childResult.value
        if (childChunks) {
          chunks = chunks.concat(childChunks.length ? childChunks : [])
        } else {
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
