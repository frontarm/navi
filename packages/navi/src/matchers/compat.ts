//
// Compat with Navi 0.10
//

import { compose } from '../utils/compose'
import { withView } from './withView'
import { map } from './map'
import { mount } from './mount'
import { redirect } from './redirect'
import { withContext } from './withContext'
import { Matcher, ResolvableMatcher } from '../Matcher'
import { Resolvable, extractDefault } from '../Resolvable'
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
  // if (process.env.NODE_ENV !== 'production') {
  //   console.warn(
  //     `Deprecation Warning: "createPage()" is deprecated. From Navi 0.12, ` +
  //       `you'll need to use the "route()" matcher instead.`,
  //   )
  // }

  return Object.assign(
    compose(
      withContext(createGetPage(options)),
      withData((req, context) => context.meta),
      withTitle((req, context) => context.title),
      withView((req, context) => context.content),
    ),
    { isDeprecatedMatcher: true }
  )
}

function inputOrEmptyObject(x) {
  return x || {}
}

export type MaybeResolvableMatcher<Context extends object = any> =
  | Matcher<Context>
  | ResolvableMatcher<Context>

export function createContext<
  ParentContext extends object = any,
  ChildContext extends object = any
>(
  maybeChildContextResolvable: Resolvable<ChildContext, ParentContext>,
  maybeChildNodeResolvable: MaybeResolvableMatcher<ChildContext>,
): Matcher<ParentContext, ChildContext> {
  // if (process.env.NODE_ENV !== 'production') {
  //   console.warn(
  //     `Deprecation Warning: "createContext()" is deprecated. From Navi 0.12, ` +
  //       `you'll need to use the "withContext()" matcher instead.`,
  //   )
  // }

  return Object.assign(
    withContext(
      maybeChildContextResolvable,
      (maybeChildNodeResolvable as any).isDeprecatedMatcher
        ? (maybeChildNodeResolvable as any)
        : map(maybeChildNodeResolvable as any)
    ),
    { isDeprecatedMatcher: true }
  )
}

interface SwitchOptions<Context extends object, Meta extends object, Content>
  extends PageOptions<Context, Meta, Content> {
  paths: { [pattern: string]: MaybeResolvableMatcher }
}

export function createSwitch<
  Context extends object,
  Meta extends object,
  Content
>(
  options: SwitchOptions<Context, Meta, Content>,
): Matcher<Context> {
  // if (process.env.NODE_ENV !== 'production') {
  //   console.warn(
  //     `Deprecation Warning: "createSwitch()" is deprecated. From Navi 0.12, ` +
  //       `you'll need to use the "map()" matcher instead.`,
  //   )
  // }

  let mappedPaths = {}
  for (let key of Object.keys(options.paths)) {
    let matcher = options.paths[key]
    mappedPaths[key] = (matcher as any).isDeprecatedMatcher ? matcher : map(matcher as any)
  }

  if (Object.keys(options).length === 1) {
    return Object.assign(mount(mappedPaths), { isDeprecatedMatcher: true }) as any
  } else {
    let { paths, ...pageOptions } = options
    return Object.assign(
      compose(
        withContext(createGetPage(pageOptions)),
        withData((req, context: Page<any, any>) => context.meta),
        withTitle((req, context: Page<any, any>) => context.title),
        withView((req, context: Page<any, any>) => context.content),
        mount(mappedPaths),
      ),
      { isDeprecatedMatcher: true }
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
  // if (process.env.NODE_ENV !== 'production') {
  //   console.warn(
  //     `Deprecation Warning: "createRedirect()" is deprecated. From Navi 0.12, ` +
  //       `you'll need to use the "redirect()" matcher instead.`,
  //   )
  // }

  let matcher = redirect(to)
  if (meta) {
    return compose(
      withData(meta),
      matcher,
    )
  }
  return Object.assign(matcher, { isDeprecatedMatcher: true })
}
