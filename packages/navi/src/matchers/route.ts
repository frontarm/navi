import { Resolvable, extractDefault, isPromiseLike } from '../Resolvable'
import { compose } from '../utils/compose'
import { withContext } from './withContext'
import { withData } from './withData'
import { withHead } from './withHead'
import { withHeaders } from './withHeaders'
import { withStatus } from './withStatus'
import { withView } from './withView'
import { NaviRequest } from '../NaviRequest'
import { withTitle } from './withTitle'

interface Route<Data extends object = any> {
  data?: Data
  head?: any
  headers?: { [name: string]: string }
  status?: number
  title?: string
  view?: any
}

interface RouteOptions<Context extends object, Data extends object = any> {
  data?: Data
  getData?: Resolvable<Data, Context>
  head?: any
  getHead?: Resolvable<any, Context, Promise<Data>>
  headers?: { [name: string]: string }
  getHeaders?: Resolvable<{ [name: string]: string }, Context, Promise<Data>>
  status?: number
  getStatus?: Resolvable<number, Context, Promise<Data>>
  title?: string
  getTitle?: Resolvable<string, Context, Promise<Data>>
  view?: any
  getView?: Resolvable<any, Context, Promise<Data>>
}

export function route<Context extends object, Data extends object = any>(
  options: RouteOptions<Context, Data> | Resolvable<Route<Data>, Context> = {},
) {
  if (typeof options !== 'function') {
    let {
      data,
      getData,
      head,
      getHead,
      headers,
      getHeaders,
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

    options = function getRoute(
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
      let [statusMaybePromise, c] = extractValue(status, getStatus, req, context)
      let [titleMaybePromise, d] = extractValue(title, getTitle, req, context)

      let headMaybePromise: any | Promise<any | undefined> | undefined
      let viewMaybePromise: any | Promise<any | undefined> | undefined
      let e: boolean | undefined
      let f: boolean | undefined
      if (req.method !== 'HEAD') {
        [headMaybePromise, e] = extractValue(head, getHead, req, context);
        [viewMaybePromise, f] = extractValue(view, getView, req, context)
      }

      // If anything is a promise, return a promise
      if (a || b || c || d || e || f) {
        return (async () => ({
          data: await dataMaybePromise,
          head: await headMaybePromise,
          headers: await headersMaybePromise,
          status: await statusMaybePromise,
          title: await titleMaybePromise,
          view: await viewMaybePromise,
        }))()
      }
      // If nothing is a promise, return a synchronous result
      else {
        return {
          data: dataMaybePromise as Data,
          head: headMaybePromise as { [name: string]: string },
          headers: headersMaybePromise as any,
          status: statusMaybePromise as number,
          title: titleMaybePromise as string,
          view: viewMaybePromise as any,
        }
      }
    }
  }

  return compose(
    withContext(options),
    withData((req, context) => context.data),
    withHead((req, context) => context.head),
    withHeaders((req, context) => context.headers),
    withStatus((req, context) => context.status),
    withTitle((req, context) => context.title),
    withView((req, context) => context.view),
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