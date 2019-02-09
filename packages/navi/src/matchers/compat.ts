//
// Compat with Navi 0.10
//

import { composeMatchers } from './composeMatchers'
import { withView } from './withView'
import { map, MapPaths } from './map'
import { redirect } from './redirect'
import { withContext } from './withContext'
import { MaybeResolvableMatcher, Matcher } from '../Matcher'
import { Resolvable, extractDefault } from '../Resolver'
import { URLDescriptor } from '../URLTools'
import { NaviRequest } from '../NaviRequest'
import { withData } from './withData'
import { withTitle } from './withTitle';

interface Page<Meta extends object, Content> {
  title?: string
  meta?: Meta
  content?: Content
}

interface PageOptions<Context extends object, Meta extends object, Content> {
  title?: string
  getTitle?: Resolvable<string, Context, Promise<Meta>>
  meta?: Meta
  getMeta?: Resolvable<Meta, Context>
  content?: Content
  getContent?: Resolvable<Content, Context, Promise<Meta>>
}

function createGetPage<Context extends object, Meta extends object, Content>(
  options: PageOptions<Context, Meta, Content>,
): Resolvable<Page<Meta, Content>, Context> {
  return async function getPage(
    req: NaviRequest,
    context: Context,
  ): Promise<Page<Meta, Content>> {
    let metaPromise: Promise<Meta> = options.getMeta
      ? Promise.resolve(options.getMeta(req, context, undefined as any))
          .then(extractDefault)
          .then(inputOrEmptyObject)
      : Promise.resolve(options.meta || {})

    let titlePromise: Promise<string | undefined> = options.getTitle
      ? Promise.resolve(options.getTitle(req, context, metaPromise)).then(
          extractDefault,
        )
      : Promise.resolve(options.title)

    let contentPromise: Promise<any | undefined> | undefined
    
    if (req.method !== 'HEAD') {
      contentPromise = options.getContent
        ? Promise.resolve(options.getContent(req, context, metaPromise)).then(
            extractDefault,
          )
        : Promise.resolve(options.content)
    }

    return {
      meta: await metaPromise,
      content: await contentPromise,
      title: await titlePromise,
    }
  }
}

export function createPage<
  Context extends object,
  Meta extends object,
  View
>(options: PageOptions<Context, Meta, View>): Matcher<Context> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `Deprecation Warning: "createPage()" is deprecated. From Navi 0.12, ` +
        `you'll need to use the "route()" matcher instead.`,
    )
  }

  return composeMatchers(
    withContext(createGetPage(options)),
    withData((req, context) => context.meta),
    withTitle((req, context) => context.title),
    withView((req, context) => context.content),
  )
}

function inputOrEmptyObject(x) {
  return x || {}
}

export function createContext<
  ParentContext extends object = any,
  ChildContext extends object = any
>(
  maybeChildContextResolvable: Resolvable<ChildContext, ParentContext>,
  maybeChildNodeResolvable: MaybeResolvableMatcher<ChildContext>,
): Matcher<ParentContext, ChildContext> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `Deprecation Warning: "createContext()" is deprecated. From Navi 0.12, ` +
        `you'll need to use the "withContext()" matcher instead.`,
    )
  }

  if (maybeChildNodeResolvable.isMatcher) {
    return composeMatchers(
      withContext(maybeChildContextResolvable),
      maybeChildNodeResolvable,
    )
  } else {
    return composeMatchers(
      withContext(maybeChildContextResolvable),
      map(maybeChildNodeResolvable as any),
    )
  }
}

interface SwitchOptions<Context extends object, Meta extends object, Content>
  extends PageOptions<Context, Meta, Content> {
  paths: MapPaths<Context>
}

export function createSwitch<
  Context extends object,
  Meta extends object,
  Content
>(
  options: SwitchOptions<Context, Meta, Content>,
): Matcher<Context> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `Deprecation Warning: "createSwitch()" is deprecated. From Navi 0.12, ` +
        `you'll need to use the "map()" matcher instead.`,
    )
  }

  if (Object.keys(options).length === 1) {
    return map(options.paths)
  } else {
    let { paths, ...pageOptions } = options
    return composeMatchers(
      withContext(createGetPage(pageOptions)),
      withData((req, context: Page<any, any>) => context.meta),
      withTitle((req, context: Page<any, any>) => context.title),
      withView((req, context: Page<any, any>) => context.content),
      map(options.paths),
    )
  }
}

export function createRedirect<
  Context extends object = any,
  Meta extends object = any
>(
  to:
    | string
    | Partial<URLDescriptor>
    | Resolvable<Partial<URLDescriptor> | string>,
  meta?: Meta | Resolvable<Meta>,
): Matcher<Context> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `Deprecation Warning: "createRedirect()" is deprecated. From Navi 0.12, ` +
        `you'll need to use the "redirect()" matcher instead.`,
    )
  }

  let matcher = redirect(to)
  if (meta) {
    return composeMatchers(
      withData(meta),
      matcher,
    )
  }
  return matcher
}
