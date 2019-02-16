import { Resolver, Resolvable } from './Resolver'
import { Segment } from './Segments'
import { Env } from './Env'

export type Matcher<ParentContext extends object, ChildContext extends object = ParentContext> =
    ((child?: MatcherGenerator<ChildContext>) => MatcherGenerator<ParentContext>) & 
    {
        isMatcher?: true;
    }

export interface ResolvableMatcher<Context extends object=any, M extends Matcher<Context> = Matcher<Context>> extends Resolvable<M, Context> {
    isMatcher?: undefined;
}

export type MaybeResolvableMatcher<Context extends object=any> = Matcher<Context> | ResolvableMatcher<Context, Matcher<Context>>

export function isValidMatcher(x: any): x is Matcher<any> {
    return x && x.isMatcher
}

export function createMatcher<ParentContext extends object, ChildContext extends object = ParentContext>(
    thunk: (childGeneratorClass?: MatcherGenerator<ChildContext>) => MatcherGenerator<ParentContext>
): Matcher<ParentContext, ChildContext> {
    return Object.assign(thunk, { isMatcher: true as true })
}

export interface MatcherOptions<Context extends object> {
    appendFinalSlash?: boolean
    env: Env<Context>
    resolver: Resolver
}

export type MatcherGenerator<Context extends object> = (options: MatcherOptions<Context>) => MatcherIterator
export type MatcherIterator = IterableIterator<Segment[]>
