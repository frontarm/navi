import { Resolvable, extractDefault } from "../Resolver"
import { composeMatchers } from "../composeMatchers"
import { withView } from "./ViewMatcher"
import { withContext } from "./ContextMatcher"
import { withData } from "./DataMatcher"
import { NaviRequest } from "../NaviRequest";
import { withTitle } from "./TitleMatcher";

interface Route<Data extends object> {
  data?: Data
  title?: string
  view?: any
}

interface RouteOptions<Context extends object, Data extends object> {
  data?: Data
  getData?: Resolvable<Data, Context>
  view?: any
  getView?: Resolvable<any, Context, Promise<Data>>
  title?: string
  getTitle?: Resolvable<string, Context, Promise<Data>>
}

export function route<Context extends object, Data extends object>(options: RouteOptions<Context, Data> | Resolvable<Route<Data>, Context> = {}) {
  if (typeof options !== 'function') {
    let { data, getData, view, getView, title, getTitle, ...other } = options

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

      let titlePromise: Promise<string | undefined> = getTitle
      ? Promise.resolve(getTitle(req, context, dataPromise)).then(
          extractDefault,
        )
      : Promise.resolve(title)

      let viewPromise: Promise<any | undefined> | undefined
  
      if (req.method !== 'HEAD') {
        viewPromise = getView
          ? Promise.resolve(getView(req, context, dataPromise)).then(
              extractDefault,
            )
          : Promise.resolve(view)
      }
  
      return {
        data: await dataPromise,
        view: await viewPromise,
        title: await titlePromise,
      }
    }
  }

  return composeMatchers(
    withContext(options),
    withData((req, context) => context.data),
    withTitle((req, context) => context.title),
    withView((req, context) => context.view)
  )
}

function inputOrEmptyObject(x) {
  return x || {}
}