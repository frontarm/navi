import { Resolvable, extractDefault, isPromiseLike } from '../Resolvable'
import { compose } from '../utils/compose'
import { withContext } from './withContext'
import { withData } from './withData'
import { withHead } from './withHead'
import { withHeaders } from './withHeaders'
import { withState } from './withState'
import { withStatus } from './withStatus'
import { withView } from './withView'
import { NaviRequest } from '../NaviRequest'
import { withTitle } from './withTitle'
import { createChunksMatcher } from '../createChunksMatcher'
import { createChunk } from '../Chunks'

interface Route<Data extends object = any> {
  data?: Data
  error?: any
  head?: any
  headers?: { [name: string]: string }
  state?: any
  status?: number
  title?: string
  view?: any
}

interface RouteOptions<Context extends object, Data extends object = any> {
  data?: Data
  getData?: Resolvable<Data, Context>
  error?: any
  head?: any
  getHead?: Resolvable<any, Context>
  headers?: { [name: string]: string }
  getHeaders?: Resolvable<{ [name: string]: string }, Context>
  state?: any
  getState?: Resolvable<any, Context>
  status?: number
  getStatus?: Resolvable<number, Context>
  title?: string
  getTitle?: Resolvable<string, Context>
  view?: any
  getView?: Resolvable<any, Context>
}

export function route<Context extends object, Data extends object = any>(
  options: RouteOptions<Context, Data> | Resolvable<Route<Data>, Context> = {},
) {
  let contextGetter: Resolvable<Route<Data>, Context>

  if (typeof options === 'function') {
    contextGetter = options
  }
  else {
    let {
      data,
      getData,
      error,
      head,
      getHead,
      headers,
      getHeaders,
      state,
      getState,
      status,
      getStatus,
      title,
      getTitle,
      view,
      getView,
      ...other
    } = options

    if (process.env.NODE_ENV !== 'production') {
      let unknownKeys = Object.keys(other)
      if (unknownKeys.length) {
        console.warn(
          `route() received unknown options ${unknownKeys
            .map(x => `"${x}"`)
            .join(', ')}.`,
        )
      }
    }

    contextGetter = function getRoute(
      req: NaviRequest,
      context: Context,
    ): Route<Data> | Promise<Route<Data>> {
      let [dataMaybePromise, a]: [Data | PromiseLike<Data>, boolean] = extractValue(data, getData, req, context)
      if (!dataMaybePromise) {
        dataMaybePromise = {} as Data
      }
      else if (isPromiseLike(dataMaybePromise)) {
        dataMaybePromise = dataMaybePromise.then(inputOrEmptyObject)
      }

      let [headersMaybePromise, b] = extractValue(headers, getHeaders, req, context)
      let [stateMaybePromise, c] = extractValue(state, getState, req, context)
      let [statusMaybePromise, d] = extractValue(status, getStatus, req, context)
      let [titleMaybePromise, e] = extractValue(title, getTitle, req, context)
      let [headMaybePromise, f] = extractValue(head, getHead, req, context)

      let viewMaybePromise: any | Promise<any | undefined> | undefined
      let g: boolean | undefined
      if (req.method !== 'HEAD') {
        [viewMaybePromise, g] = extractValue(view, getView, req, context)
      }

      // If anything is a promise, return a promise
      if (a || b || c || d || e || f || g) {
        return (async () => ({
          data: await dataMaybePromise,
          error,
          head: await headMaybePromise,
          headers: await headersMaybePromise,
          state: await stateMaybePromise,
          status: await statusMaybePromise,
          title: await titleMaybePromise,
          view: await viewMaybePromise,
        }))()
      }
      // If nothing is a promise, return a synchronous result
      else {
        return {
          data: dataMaybePromise as Data,
          error,
          head: headMaybePromise as { [name: string]: string },
          headers: headersMaybePromise as any,
          state: stateMaybePromise as any,
          status: statusMaybePromise as number,
          title: titleMaybePromise as string,
          view: viewMaybePromise as any,
        }
      }
    }
  }

  return compose(
    withContext((req, context) =>
      req.crawler ? {} : contextGetter(req, context)
    ),
    withData(req => req.context.data),
    withHead(req => req.context.head),
    withHeaders(req => req.context.headers),
    withState(req => req.context.state || null),
    withStatus(req => req.context.status),
    withTitle(req => req.context.title),
    withView(req => req.context.view, undefined, true),
    createChunksMatcher(
      req => req.context.error,
      undefined,
      (error, request) => (error ? [createChunk('error', request, { error })] : []),
    )
  )
}

function inputOrEmptyObject(x) {
  return x || {}
}

function extractValue<T, Context extends object>(value: T | undefined, getter: Resolvable<T, Context> | undefined, request: NaviRequest, context: Context): [T | PromiseLike<T>, boolean] {
  if (getter) {
    let valueOrPromise: T | PromiseLike<T | { default: T }> = getter(request, context)
    if (isPromiseLike(valueOrPromise)) {
      return [valueOrPromise.then(extractDefault), true]
    }
    return [valueOrPromise, false]
  }
  else {
    return [value!, false]
  }
}
