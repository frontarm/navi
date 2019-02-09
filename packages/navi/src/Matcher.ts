import { Resolver, Resolvable } from './Resolver'
import { Segment, createNotFoundSegment } from './Segments'
import { Env } from './Env'

export type Matcher<ParentContext extends object, ChildContext extends object = ParentContext> =
    ((child?: MatcherGeneratorClass<ChildContext>) => MatcherGeneratorClass<ParentContext>) & 
    {
        isMatcher: true;
    }

export interface ResolvableMatcher<Context extends object=any, M extends Matcher<Context> = Matcher<Context>> extends Resolvable<M, Context> {
    isMatcher?: undefined;
}

export type MaybeResolvableMatcher<Context extends object=any> = Matcher<Context> | ResolvableMatcher<Context, Matcher<Context>>

export interface MatcherOptions<Context extends object> {
    appendFinalSlash?: boolean
    env: Env<Context>;
    resolver: Resolver
}

export function isValidMatcher(x: any): x is Matcher<any> {
    return x && x.isMatcher
}

export function createMatcher<ParentContext extends object, ChildContext extends object = ParentContext>(
    thunk: (childGeneratorClass?: MatcherGeneratorClass<ChildContext>) => MatcherGeneratorClass<ParentContext>
): Matcher<ParentContext, ChildContext> {
    return Object.assign(thunk, { isMatcher: true as true })
}

export interface MatcherGeneratorClass<Context extends object, MG extends MatcherGenerator<Context> = MatcherGenerator<Context>> {
    new (options: MatcherOptions<Context>): MG
}

export class MatcherGenerator<Context extends object> {
    appendFinalSlash: boolean
    env: Env;
    resolver: Resolver;
    wildcard: boolean;

    ['constructor']: MatcherGeneratorClass<Context>

    constructor(options: MatcherOptions<Context>, wildcard = false) {
        this.appendFinalSlash = !!options.appendFinalSlash
        this.env = options.env
        this.resolver = options.resolver

        this.wildcard = wildcard
    }

    // Get the segment object given the current state.
    getResult(): Segment[] {
        let unmatchedPathnamePart = this.env.request.path
        if (this.wildcard || !unmatchedPathnamePart || unmatchedPathnamePart === '/') {
            return this.execute()
        }
        else {
            // This couldn't be matched due to missing required
            // params, or a non-exact match without a default path.
            return [createNotFoundSegment(this.env.request)]
        }
    };
    
    protected execute(): Segment[] {
        // abstract.
        return undefined as any
    }
}
