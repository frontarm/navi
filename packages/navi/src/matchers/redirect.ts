import { createChunk, Chunk, createNotFoundChunk } from '../Chunks'
import { Resolvable } from '../Resolvable'
import { Matcher } from '../Matcher'
import { URLDescriptor, joinPaths, createURLDescriptor } from '../URLTools'
import { createChunksMatcher } from '../createChunksMatcher'

export function redirect<Context extends object = any>(
  maybeResolvableTo: string | Partial<URLDescriptor> | Resolvable<Partial<URLDescriptor> | string>,
  { exact = true } = {}
): Matcher<Context> {
  return createChunksMatcher(
    maybeResolvableTo,
    undefined,
    (to, request) => {
      let toHref: string | undefined
      if (typeof to === 'string') {
        toHref = to[0] === '/' ? to : joinPaths('/', request.mountpath, to)
      }
      else if (to) {
        toHref = createURLDescriptor(to).href
      }
      return toHref ? [createChunk('redirect', request, { to: toHref })] as Chunk[] : []
    },
    exact,
    true // proccess during crawl
  )
}
