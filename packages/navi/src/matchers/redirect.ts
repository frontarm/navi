import { Resolvable } from '../Resolver'
import { createSegment, createNotReadySegment } from '../Segments'
import { createSegmentsMatcher } from './createSegmentsMatcher'
import {
  Matcher,
  MatcherOptions,
} from '../Matcher'
import { URLDescriptor, joinPaths, createURLDescriptor } from '../URLTools';

export function redirect<Context extends object = any>(
  maybeResolvableTo: string | Partial<URLDescriptor> | Resolvable<Partial<URLDescriptor> | string>
): Matcher<Context> {
  let getTo: Resolvable<Partial<URLDescriptor> | string, Context> =
    typeof maybeResolvableTo === 'function'
      ? (maybeResolvableTo as Resolvable<Partial<URLDescriptor> | string>)
      : () => maybeResolvableTo

  return createSegmentsMatcher(({ env, resolver }: MatcherOptions<Context>) => {
    let resolution = resolver.resolve(env, getTo)
    let { value: to, status } = resolution
    if (status !== 'ready') {
      return [createNotReadySegment(env.request, resolution)]
    }
    
    // TODO: support all relative URLs
    let toHref: string | undefined
    if (typeof to === 'string') {
      if (to.slice(0, 2) === './') {
        toHref = joinPaths(env.request.mountpath.split('/').slice(0, -1).join('/'), to.slice(2))
      }
      else {
        toHref = to
      }
    }
    else if (to) {
      toHref = createURLDescriptor(to).href
    }
    return toHref ? [createSegment('redirect', env.request, { to: toHref })] : []
  })
}
