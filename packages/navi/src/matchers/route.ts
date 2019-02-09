import { Resolvable, extractDefault } from '../Resolver'
import { composeMatchers } from './composeMatchers'
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

    options = async function getRoute(
      req: NaviRequest,
      context: Context,
    ): Promise<Route<Data>> {
      let dataPromise: Promise<Data> = getData
        ? Promise.resolve(getData(req, context, undefined as any))
            .then(extractDefault)
            .then(inputOrEmptyObject)
        : Promise.resolve(data || {})

      let headersPromise: Promise<{ [name: string]: string } | undefined> = getHeaders
        ? Promise.resolve(getHeaders(req, context, dataPromise)).then(
            extractDefault,
          )
        : Promise.resolve(headers)

      let statusPromise: Promise<number | undefined> = getStatus
        ? Promise.resolve(getStatus(req, context, dataPromise)).then(
            extractDefault,
          )
        : Promise.resolve(status)

      let titlePromise: Promise<string | undefined> = getTitle
        ? Promise.resolve(getTitle(req, context, dataPromise)).then(
            extractDefault,
          )
        : Promise.resolve(title)

      let headPromise: Promise<any | undefined> | undefined
      let viewPromise: Promise<any | undefined> | undefined

      if (req.method !== 'HEAD') {
        headPromise = getHead
          ? Promise.resolve(getHead(req, context, dataPromise)).then(
              extractDefault,
            )
          : Promise.resolve(head)

        viewPromise = getView
          ? Promise.resolve(getView(req, context, dataPromise)).then(
              extractDefault,
            )
          : Promise.resolve(view)
      }

      return {
        data: await dataPromise,
        head: await headPromise,
        headers: await headersPromise,
        status: await statusPromise,
        title: await titlePromise,
        view: await viewPromise,
      }
    }
  }

  return composeMatchers(
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
