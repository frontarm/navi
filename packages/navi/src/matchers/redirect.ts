import { createChunk, Chunk, createNotFoundChunk } from '../Chunks'
import { Resolvable } from '../Resolvable'
import { Matcher } from '../Matcher'
import { URLDescriptor, joinPaths, createURLDescriptor } from '../URLTools'
import { createChunksMatcher } from '../createChunksMatcher'

export function redirect<Context extends object = any>(
  maybeResolvableTo: string | Partial<URLDescriptor> | Resolvable<Partial<URLDescriptor> | string>
): Matcher<Context> {
  return createChunksMatcher(
    maybeResolvableTo,
    undefined,
    (to, request) => {
      let unmatchedPathnamePart = request.path
      if (unmatchedPathnamePart && unmatchedPathnamePart !== '/') {
        return [createNotFoundChunk(request)]
      }

      // TODO: support all relative URLs
      let toHref: string | undefined
      if (typeof to === 'string') {
        if (to.slice(0, 2) === './') {
          toHref = joinPaths(request.mountpath.split('/').slice(0, -1).join('/'), to.slice(2))
        }
        else {
          toHref = to
        }
      }
      else if (to) {
        toHref = createURLDescriptor(to).href
      }
      return toHref ? [createChunk('redirect', request, { to: toHref })] as Chunk[] : []
    },
  )
}
