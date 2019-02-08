import { Resolvable, extractDefault } from "../Resolver"
import { composeMatchers } from "../composeMatchers"
import { withContents } from "./ContentMatcher"
import { withContext } from "./ContextMatcher"
import { withInfo } from "./InfoMatcher"
import { NaviRequest } from "../NaviRequest";

interface Route<Info extends object> {
  info?: Info
  content?: any
  contents?: any[]
}

interface RouteOptions<Context extends object, Info extends object> {
  info?: Info
  getInfo?: Resolvable<Info, Context>
  content?: any
  getContent?: Resolvable<any, Context, Promise<Info>>
  contents?: any[]
  getContents?: Resolvable<any[], Context, Promise<Info>>
}

export function route<Context extends object, Info extends object>(options: RouteOptions<Context, Info> | Resolvable<Route<Info>, Context> = {}) {
  if (typeof options !== 'function') {
    let { info, getInfo, content, getContent, contents, getContents, ...other } = options

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
    ): Promise<Route<Info>> {
      let infoPromise: Promise<Info> = getInfo
        ? Promise.resolve(getInfo(req, context, undefined as any))
            .then(extractDefault)
            .then(inputOrEmptyObject)
        : Promise.resolve(info || {})

      let contentPromise: Promise<any | undefined> | undefined
      let contentsPromise: Promise<any[] | undefined> | undefined
  
      if (req.method !== 'HEAD') {
        contentPromise = getContent
          ? Promise.resolve(getContent(req, context, infoPromise)).then(
              extractDefault,
            )
          : Promise.resolve(content)

        contentsPromise = getContents
          ? Promise.resolve(getContents(req, context, infoPromise)).then(
              extractDefault,
            )
          : Promise.resolve(contents)
      }
  
      return {
        info: await infoPromise,
        content: await contentPromise,
        contents: await contentsPromise,
      }
    }
  }

  return composeMatchers(
    withContext(options),
    withInfo((req, context) =>
      context.info
    ),
    withContents((req, context) =>
      (context.contents || []).concat(context.content || [])
    )
  )
}

function inputOrEmptyObject(x) {
  return x || {}
}