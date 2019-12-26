import * as React from 'react'
import { Route, Chunk, ViewChunk } from 'navi'
import {
  HashScrollContext,
  HashScrollBehavior,
  scrollToHash,
} from './HashScroll'
import { NaviContext } from './NaviContext'
import { ViewHeadRendererContext } from './ViewHeadRendererContext'

function defaultUseViewChunkPredicate(chunk: Chunk) {
  return chunk.type === 'view'
}

export function useViewElement(
  options: UseViewOptions = {},
): React.ReactElement<any> | null {
  let result = useView(options)
  return result && result.element
}

export interface UseViewOptions {
  disableScrolling?: boolean
  hashScrollBehavior?: HashScrollBehavior

  renderHead?: (chunks: Chunk[]) => React.ReactNode

  /**
   * The first Chunk that matches this predicate function will be consumed,
   * along with all Chunks before it.
   *
   * By default, looks for a chunk with type === 'view'.
   */
  where?: (Chunk: Chunk) => boolean
}

export interface UseViewResult {
  chunks: Chunk[]
  connect: (node: React.ReactNode) => React.ReactElement<any>
  content: any
  element: React.ReactElement<any>
  final: boolean
  head: any
}

export function useView({
  disableScrolling = false,
  hashScrollBehavior,
  renderHead,
  where = defaultUseViewChunkPredicate,
}: UseViewOptions = {}): null | UseViewResult {
  let hashScrollBehaviorFromContext = React.useContext(HashScrollContext)
  let renderHeadFromContext = React.useContext(ViewHeadRendererContext)
  let context = React.useContext(NaviContext)

  if (hashScrollBehavior === undefined) {
    hashScrollBehavior = hashScrollBehaviorFromContext
  }
  if (renderHead === undefined && renderHeadFromContext) {
    renderHead = renderHeadFromContext
  }

  let route = context.steadyRoute || context.busyRoute

  if (!route) {
    throw new Error(
      'react-navi: A <View> component cannot be rendered outside of a <Router> or <NaviProvider> component.',
    )
  }

  let unconsumedChunks = context.unconsumedSteadyRouteChunks || route.chunks
  let index = unconsumedChunks.findIndex(where)
  let view = index !== -1 && (unconsumedChunks[index] as ViewChunk).view

  // Find any other chunks that come before this chunk, or after this one if
  // this is the final view chunk.
  //
  // Don't treat this as the final chunk is there is an error, as that means
  // we don't know whether this is really meant to be the final chunk, and we
  // don't want to throw an error before rendering whatever views we can.
  let final =
    index === -1 ||
    (!unconsumedChunks.slice(index + 1).find(where) && route.type !== 'error')

  let chunks = React.useMemo(
    () => (final ? unconsumedChunks : unconsumedChunks.slice(0, index + 1)),
    [final, unconsumedChunks, index],
  )

  // Look for an error amongst any route chunks that haven't already been used
  // by a `useView()` and throw it.
  let errorChunk = chunks.find(chunk => chunk.type === 'error')
  if (errorChunk) {
    throw errorChunk.error || new Error('Unknown routing error')
  }

  // If there's no steady route, then we'll need to wait until a steady
  // route becomes available using Supsense.
  if (!view && !context.steadyRoute) {
    throw context.navigation.getRoute()
  }

  let childContext = React.useMemo(
    () => ({
      ...context,
      unconsumedSteadyRouteChunks: final
        ? []
        : unconsumedChunks.slice(index + 1),
    }),
    [context, unconsumedChunks, index],
  )

  let connect = React.useCallback(
    children => {
      return (
        <NaviContext.Provider value={childContext}>
          {// Clone the content to force a re-render even if content hasn't
          // changed, as Provider is a PureComponent.
          React.isValidElement(children)
            ? React.cloneElement(children)
            : children}
        </NaviContext.Provider>
      )
    },
    [childContext],
  )

  let content: React.ReactNode = React.useMemo(
    () =>
      typeof view === 'function'
        ? React.createElement(view, {
            route: context.steadyRoute,
          })
        : view || null,
    [view, context.steadyRoute],
  )

  let head = React.useMemo(() => (!renderHead ? null : renderHead(chunks)), [
    renderHead,
    chunks,
  ])

  // Scroll to hash or top of page if appropriate.
  let lastRouteRef = React.useRef<Route | undefined>()
  React.useEffect(() => {
    let nextRoute = route
    let prevRoute = lastRouteRef.current
    lastRouteRef.current = route

    if (final && route && unconsumedChunks.length !== 0) {
      if (nextRoute && nextRoute.type !== 'busy') {
        if (
          prevRoute &&
          nextRoute.url.pathname === prevRoute.url.pathname &&
          nextRoute.url.search === prevRoute.url.search &&
          nextRoute.url.hash === prevRoute.url.hash
        ) {
          return
        }

        if (
          !disableScrolling &&
          (!prevRoute ||
            !prevRoute.url ||
            prevRoute.url.hash !== nextRoute.url.hash ||
            prevRoute.url.pathname !== nextRoute.url.pathname)
        ) {
          scrollToHash(
            nextRoute.url.hash,
            prevRoute &&
              prevRoute.url &&
              prevRoute.url.pathname === nextRoute.url.pathname
              ? hashScrollBehavior
              : 'auto',
          )
        }
      }
    }
  }, [route])

  let result = React.useMemo(
    () => ({
      chunks,
      connect,
      content,
      element: connect(
        <>
          {head}
          {content}
        </>,
      ),
      final,
      head,
    }),
    [chunks, connect, content, final, head],
  )

  return unconsumedChunks.length === 0 ? null : result
}

export interface ViewProps {
  disableScrolling?: boolean
  hashScrollBehavior?: HashScrollBehavior

  renderHead?: (chunks: Chunk[]) => React.ReactNode

  /**
   * The first Chunk that matches this will be consumed, along with
   * all Chunks before it.
   *
   * By default, looks for a page, a redirect, or a switch with content.
   */
  where?: (Chunk: Chunk) => boolean
}

export const View: React.FunctionComponent<ViewProps> = function View({
  disableScrolling,
  hashScrollBehavior,
  renderHead,
  where,
}: ViewProps) {
  let result = useView({
    disableScrolling,
    hashScrollBehavior,
    renderHead,
    where,
  })

  if (!result) {
    throw new Error('A Navi <View> was not able to find a view to render.')
  }
  return result.element
}
