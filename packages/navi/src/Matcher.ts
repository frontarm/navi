import { ContextMatcher } from './ContextMatcher'
import { Resolver, Resolvable } from './Resolver'
import { Segment, createNotFoundSegment } from './Segments'
import { MapMatcher } from './MapMatcher'
import { ContentMatcher } from './ContentMatcher'
import { RedirectMatcher } from './RedirectMatcher'
import { Env } from './Env'

export type MatcherType =
    | 'map'
    | 'content'
    | 'redirect'
    | 'context'

export interface MatcherClass<Context extends object, RM extends MatcherBase<Context> = MatcherBase<Context>> {
    isMatcher: boolean;
    type: MatcherType;

    new(options: MatcherOptions<Context>): RM;
    prototype: RM;
}

export type Matcher<Context extends object> = MapMatcher<Context> | ContentMatcher<Context> | RedirectMatcher<Context> | ContextMatcher<Context>

export interface ResolvableMatcher<M extends Matcher<Context> = Matcher<Context>, Context extends object=any> extends Resolvable<M, Context> {
    isMatcher?: undefined;
}

export type MaybeResolvableMatcher<Context extends object=any> = Matcher<Context> | ResolvableMatcher<Matcher<Context>, Context>

export interface MatcherOptions<Context extends object> {
    appendFinalSlash?: boolean
    env: Env<Context>;
    resolver: Resolver
}

export interface MatcherResult<S extends Segment = Segment> {
    segments: S[]
    resolutionIds: number[]
}

export abstract class MatcherBase<Context extends object> {
    appendFinalSlash: boolean
    env: Env;
    resolver: Resolver;
    wildcard: boolean;

    ['constructor']: Matcher<Context>

    constructor(options: MatcherOptions<Context>, wildcard = false) {
        this.appendFinalSlash = !!options.appendFinalSlash
        this.env = options.env
        this.resolver = options.resolver

        this.wildcard = wildcard
    }

    // Get the segment object given the current state.
    getResult(): MatcherResult {
        let unmatchedPathnamePart = this.env.request.path
        if (this.wildcard || !unmatchedPathnamePart || unmatchedPathnamePart === '/') {
            return this.execute()
        }
        else {
            // This couldn't be matched due to missing required
            // params, or a non-exact match without a default path.
            return {
                resolutionIds: [],
                segments: [createNotFoundSegment(this.env.request)]
            }
        }
    };
    
    protected abstract execute(): MatcherResult;
}
