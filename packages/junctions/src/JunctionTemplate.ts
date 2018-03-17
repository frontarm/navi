import { Location, concatLocations } from './Location'
import { Junction, Redirect, JunctionDescendentSegments, JunctionChildSegment, JunctionRoute } from './Route'
import { compilePattern, CompiledPattern, MountedPattern, PatternMatch, createChildMountedPattern, matchMountedPatternAgainstLocation } from './Patterns'
import { Matcher, Template, TemplateBase, AsyncTemplate, MatcherOptions } from './Template'


export interface JunctionTemplate<
    Meta = any,
    Component = any,
    Children extends { [pattern: string]: Template | AsyncTemplate } = any,
> extends TemplateBase<JunctionMatcher<JunctionTemplate<Meta, Component, Children>>> {
    templateType: 'Junction'

    new(options: MatcherOptions): JunctionMatcher<JunctionTemplate<Meta, Component, Children>>;

    meta: Meta;
    component: Component;
    children: Children;
    
    compiledPatterns: CompiledPattern[],
}


export class JunctionMatcher<J extends JunctionTemplate<any, any, { [pattern: string]: Template | AsyncTemplate }> = JunctionTemplate> extends Matcher {
    static type: 'Template' = 'Template'
    static templateType: 'Junction' = 'Junction'

    childMountedPattern?: MountedPattern;
    childMatcher?: Matcher;
    childStatus: 'ready' | 'busy' | 'error';
    childError?: any;

    ['constructor']: JunctionTemplate<J>;
    constructor(options: MatcherOptions) {
        super(options)

        if (this.match) {
            let remainingLocation: Location =
                this.match.remainingLocation
                    ? this.match.remainingLocation
                    : { pathname: '/' }

            let compiledPatterns = this.constructor.compiledPatterns
            
            // Start from the beginning and take the first result, as child mounts
            // are sorted such that the first matching mount is the the most
            // precise match (and we always want to use the most precise match).
            for (let i = compiledPatterns.length - 1; i >= 0; i--) {
                let childMountedPattern = createChildMountedPattern(this.mountedPattern, compiledPatterns[i])
                let match = matchMountedPatternAgainstLocation(childMountedPattern, remainingLocation)
                if (match) {
                    this.childMountedPattern = childMountedPattern

                    let childMatcherOptions = {
                        parentLocationPart: this.segmentLocation,
                        matchableLocationPart: remainingLocation,
                        mountedPattern: this.childMountedPattern,
                        onChange: this.handleChange,
                        routerConfig: this.routerConfig,
                        shouldFetchContent: this.shouldFetchContent,
                    }

                    if (childMountedPattern.template.type === 'Template') {
                        // We have already fetched this mount, so we can
                        // create an instance and be done.
                        this.childMatcher = new childMountedPattern.template(childMatcherOptions)
                        this.childStatus = 'ready'
                    }
                    else if (childMountedPattern.template.value) {
                        this.childMatcher = new childMountedPattern.template.value(childMatcherOptions)
                        this.childStatus = 'ready'
                    }
                    else {
                        this.watchAsync(
                            childMountedPattern.template,
                            {
                                type: 'junctionChild',
                                location: concatLocations(this.segmentLocation, match.matchedLocation),
                            },
                            (status, value, error) => {
                                if (value) {
                                    this.childMatcher = new value(childMatcherOptions)
                                }
                                this.childStatus = status
                                this.childError= error
                            }
                        )
                    }

                    // The first match is always the only match, as we don't allow
                    // for ambiguous patterns.
                    break
                }
            }
        }
    }

    willUnmount() {
        if (this.childMatcher) {
            this.childMatcher.willUnmount()
        }

        super.willUnmount()
    }

    isBusy(): boolean {
        return !!this.waitingForWatch || !!(this.childMatcher && this.childMatcher.isBusy())
    }

    getRoute(): JunctionRoute<J> | undefined {
        if (!this.match) {
            // This junction couldn't be matched due to missing required
            // params, or a non-exact match without a default path.
            return
        }
        else {
            let status: 'ready' | 'busy' | 'error' | 'notfound'
            let descendents: JunctionDescendentSegments<J> = [] as any
            if (!this.childMountedPattern) {
                // This junction was matched, but we couldn't figure out what to do
                // with the remaining location part (or there was no remaining part).
                status = 'notfound'
            }
            else if (this.childStatus === 'ready') {
                let childRoute = (this.childMatcher as Matcher).getRoute()
                if (childRoute) {
                    descendents = childRoute as any
                    status = 'ready'
                }
                else {
                    status = 'notfound'
                }
            }
            else {
                status = this.childStatus
            }

            let route: JunctionRoute<J> = [this.createSegment('junction', {
                status,
                component: this.constructor.component,
                meta: this.constructor.meta,
                children: this.constructor.children,
                activePattern: this.childMountedPattern && this.childMountedPattern.relativePattern,
                activeChild: descendents[0] || false,
                activeRoute: descendents,
            })]

            // `concat` makes TypeScript bawk for some reason, so appendending
            // the descendents with push instead.
            route.push(...descendents)

            return route
        }
    }
}


export function createJunctionTemplate<
    Meta,
    Component,
    Children extends { [pattern: string]: Template | AsyncTemplate }
>(getOptions: {
    children: Children,
    meta?: Meta,
    params?: string[],
    component?: Component,
} | ((helpers: Helpers) => {
    children: Children,
    meta?: Meta,
    params?: string[],
    component?: Component,
})): JunctionTemplate<Meta, Component, Children> {
    let helpers = { split: split }
    let options = typeof getOptions === 'function' ? getOptions(helpers) : getOptions

    if (!options) {
        throw new Error(`createJunction() was supplied a function that doesn't return any value!`)
    }
    if (!options.children) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`createJunction() was called without a "children" option, but a junction without children doesn't make any sense!`)
        }
        options.children = {} as any
    }

    // Wildcards in compiled patterns are null (\0) characters, so they'll
    // always be sorted to the top. As such, by sorting the patterns, the
    // most specific (i.e. without wildcard) will always be at the bottom.
    let compiledPatterns =
        Object.keys(options.children)
            .map(pattern => compilePattern(pattern, options.children[pattern]))
            .sort((x, y) => compareStrings(x.relativeKey, y.relativeKey))

    if (process.env.NODE_ENV !== 'production') {
        let {
            children,
            meta,
            params,
            component,
            ...other
        } = options

        if (!('component' in options)) {
            console.warn(`createJunction() was called without a "component" option, where you'll usually need to provide one. If you're sure you don't need a component, pass a value of "null".`)
        }

        let unknownKeys = Object.keys(other)
        if (unknownKeys.length) {
            console.warn(`createJunction() received unknown options ${unknownKeys.map(x => `"${x}"`).join(', ')}.`)
        }

        if (compiledPatterns.length === 0) {
            console.warn(`createJunction() was called with an empty object {} for "children". This doesn't make any sense.`)
        }

        // Check to make sure that none of the junction supplied as patterns
        // may intefere with each other.
        let len = compiledPatterns.length
        if (compiledPatterns.length >= 2) {
            let previousPattern = compiledPatterns[len - 1]
            for (let i = len - 2; i >= 0; i--) {
                let pattern = compiledPatterns[i]

                // If previous pattern matches this one, and doesn't completely
                // replace it, and either item is a junction, then there could
                // be a conflict.
                // TODO: this warning will have false positives when a wildcard
                // is on a page and the junction is on a more specific element.
                let replacedKey = pattern.relativeKey.replace(previousPattern.relativeRegExp, '')
                if (replacedKey !== pattern.relativeKey && replacedKey.length > 0) {
                    if ((previousPattern.template.type === "Template" && previousPattern.template.templateType === "Junction") ||
                        (pattern.template.type === "Template" && pattern.template.templateType === "Junction"))
                    console.warn(`createJunction() received Junctions for patterns "${previousPattern.relativePattern}" and "${pattern.relativePattern}", but this may lead to multiple junctions sharing the same URL.`)
                }

                previousPattern = pattern
            }
        }

        // Check for missing mountables on patterns
        for (let i = 0; i < len; i++) {
            if (!compiledPatterns[i].template) {
                let pattern = compiledPatterns[i].relativePattern
                console.warn(`createJunction() received "${typeof compiledPatterns[i].template}" for pattern "${pattern}"!`)       
            }
        }

        // Check that a junction hasn't been supplied at "/", as the junction
        // could interfere with this junction.
        let indexPattern = compiledPatterns.find(pattern => pattern.relativeKey === '/')
        if (indexPattern) {
            // Note that if we receive a split, we can't check the type, as we
            // won't know it until the split is loaded. But the same rules
            // still apply!
            if (indexPattern.template.type === "Template" && indexPattern.template.templateType === "Junction") {
                console.warn(`createJunction() received a Junction at the "/" pattern, but "/" must be a Page or a Redirect!`)
            }
        }
    }

    return class extends JunctionMatcher<JunctionTemplate<Meta, Component, Children>> {
        static children = options.children
        static meta = options.meta as Meta
        static component = options.component as Component
        static params = options.params || []
        static compiledPatterns = compiledPatterns
    }
}


type Helpers = {
    split: typeof split,
}

function split<T extends Template>(getter: () => Promise<T> | T): AsyncTemplate<T> {
    return {
        type: 'AsyncObjectContainer',
        status: undefined,
        getter: getter,
        value: <any>undefined
    }
}

function compareStrings(a, b) {   
    return (a<b?-1:(a>b?1:0));  
}