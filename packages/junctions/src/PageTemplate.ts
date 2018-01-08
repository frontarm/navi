import { ContentHelpers, createContentHelpers } from './ContentHelpers'
import { AsyncObjectContainer } from './AsyncObjectContainer'
import { Location, concatLocations } from './Location'
import { Page, Redirect, PageRoute } from './Route'
import { Matcher, TemplateBase, AsyncTemplate, MatcherOptions } from './Template'
import { RouterConfig } from './RouterConfig'


export type PageContentContainer<Content> = AsyncObjectContainer<Content>


export interface PageTemplate<
    Meta = any,
    Component = any,
    Content = any
> extends TemplateBase<PageMatcher<Meta, Component, Content>> {
    templateType: 'Page'
    
    new(options: MatcherOptions): PageMatcher<Meta, Component, Content>;

    title: string
    component: Component
    meta: Meta
    contentContainer: PageContentContainer<Content>
}


export class PageMatcher<
    Meta,
    Component,
    Content
> extends Matcher {
    static type: 'Template' = 'Template'
    static templateType: 'Page' = 'Page'
    
    content?: Content;
    contentStatus: 'ready' | 'busy' | 'error';
    contentError?: any;
    
    ['constructor']: PageTemplate<Meta, Component, Content>;
    constructor(options: MatcherOptions) {
        super(options)

        if (this.match) {
            let remainingLocation = this.match.remainingLocation
            if (remainingLocation && remainingLocation.pathname !== "/") {
                // We don't understand the remaining part of the path.
                delete this.match
            }
            else if (this.match && this.shouldFetchContent) {
                this.watchAsync(
                    this.constructor.contentContainer,
                    { type: 'content', location: this.segmentLocation },
                    (status, value, error?) => {
                        this.content = value
                        this.contentStatus = status
                        this.contentError = error
                    }
                )
            }
        }
    }

    getRoute(): PageRoute<PageTemplate<Meta, Component, Content>> | undefined {
        if (!this.match) {
            // Required params are missing, or there is an unknown part to the
            // path.
            return
        }

        return [this.createSegment('page', {
            title: this.constructor.title,
            meta: this.constructor.meta,
            component: this.constructor.component,

            content: this.content,
            contentStatus: this.contentStatus,
            contentError: this.contentError,
        })]
    }
}


export function createPageTemplate<
    Meta,
    Component,
    Content
>(options: {
    params?: string[],
    title: string,
    component?: Component,
    meta?: Meta,
    getContent?: (helpers: ContentHelpers) => Content | Promise<Content>
}): PageTemplate<Meta, Component, Content> {
    let getter: (routerConfig: RouterConfig) => Content | Promise<Content>
    if (options.getContent) {
        let getContent = options.getContent
        getter = (routerConfig: RouterConfig) =>
            getContent(createContentHelpers(routerConfig))
    }
    else {
        getter = (() => {}) as any
    }

    if (process.env.NODE_ENV !== 'production') {
        let {
            params,
            title,
            component,
            meta,
            getContent,
            ...other
        } = options

        if (!('component' in options)) {
            console.warn(`createPage() was called without a "component" option, where you'll usually need to provide one. If you're sure you don't need a component, pass a value of "null".`)
        }

        let unknownKeys = Object.keys(other)
        if (unknownKeys.length) {
            console.warn(`createPage() received unknown options ${unknownKeys.map(x => `"${x}"`).join(', ')}.`)
        }

        if (title === undefined) {
            console.warn(`createPage() must be supplied a "title" option. If you don't want to give your page a title, pass "null' as the title.`)
        }
    }

    let contentContainer: PageContentContainer<Content> = {
        type: 'AsyncObjectContainer',
        status: undefined,
        getter,
        value: <any>undefined
    }
        
    return class extends PageMatcher<Meta, Component, Content> {
        static title = options.title
        static component = options.component as Component
        static meta = options.meta as Meta
        static params = options.params || []
        static contentContainer = contentContainer
    }
}
