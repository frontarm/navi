import { Context } from './Context'
import { Resolver, Resolvable } from './Resolver'
import { RouteSegment, createNotFoundSegment } from './Segments'
import { Switch } from './Switch'
import { Page } from './Page'
import { Redirect } from './Redirect'
import { Env } from './Env'

export type MatcherType =
    | 'switch'
    | 'page'
    | 'redirect'
    | 'context'

export interface MatcherClass<Context extends object, RM extends MatcherBase<Context> = MatcherBase<Context>> {
    isMatcher: boolean;
    type: MatcherType;

    new(options: MatcherOptions<Context>): RM;
    prototype: RM;
}

export type Matcher = Switch | Page | Redirect | Context

export interface ResolvableMatcher<M extends Matcher = Matcher, Context extends object=any> extends Resolvable<M, Context> {
    isMatcher?: undefined;
}

export type MaybeResolvableMatcher<Context extends object=any> = Matcher | ResolvableMatcher<Matcher, Context>

export interface MatcherOptions<Context extends object> {
    appendFinalSlash?: boolean
    env: Env<Context>;
    resolver: Resolver
}

export interface MatcherResult<S extends RouteSegment = RouteSegment> {
    segment: S
    resolutionIds: number[]
}

export abstract class MatcherBase<Context extends object> {
    appendFinalSlash: boolean
    env: Env;
    resolver: Resolver;
    wildcard: boolean;

    ['constructor']: Matcher

    constructor(options: MatcherOptions<Context>, wildcard = false) {
        this.appendFinalSlash = !!options.appendFinalSlash
        this.env = options.env
        this.resolver = options.resolver

        this.wildcard = wildcard
    }

    // Get the segment object given the current state.
    getResult(): MatcherResult {
        let unmatchedPathnamePart = this.env.unmatchedPathnamePart
        if (this.wildcard || !unmatchedPathnamePart || unmatchedPathnamePart === '/') {
            return this.execute()
        }
        else {
            // This switch couldn't be matched due to missing required
            // params, or a non-exact match without a default path.
            return {
                resolutionIds: [],
                segment: createNotFoundSegment(this.env)
            }
        }
    };
    
    protected abstract execute(): MatcherResult;
}
