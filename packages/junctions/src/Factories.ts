import { Location } from './Location'
import {
    Definition, AsyncDefinition, MountOptions, 
    JunctionDefinition, JunctionMount,
    PageDefinition, PageMount, AsyncContent,
    RedirectDefinition, RedirectMount,
} from './Mounts'
import { JunctionManager } from './JunctionManager'
import { compilePattern } from './Patterns'


export function defineJunction<
    Children extends { [pattern: string]: Definition | AsyncDefinition },
    Component,
    Payload
>(getOptions: {
    children: Children,
    defaultPath?: keyof Children | null,
    payload?: Payload,
    params?: ParamsDefinition,
    component?: Component,
} | ((helpers: Helpers) => {
    children: Children,
    defaultPath?: keyof Children | null,
    payload?: Payload,
    params?: ParamsDefinition,
    component?: Component,
})): JunctionDefinition<Children, Component, Payload> {
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
    
    // Set the default path
    if (options.defaultPath === undefined) {
        options.defaultPath = options.children['/'] ? '/' : null
    }

    if (process.env.NODE_ENV !== 'production') {
        let {
            children,
            defaultPath,
            payload,
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
                    if ((previousPattern.mountable.type === "Mountable" && previousPattern.mountable.mountableType === "Junction") ||
                        (pattern.mountable.type === "Mountable" && pattern.mountable.mountableType === "Junction"))
                    console.warn(`createJunction() received Junctions for patterns "${previousPattern.relativePattern}" and "${pattern.relativePattern}", but this may lead to multiple junctions sharing the same URL.`)
                }

                previousPattern = pattern
            }
        }
        
        // Check that the default path makes sense
        if (options.defaultPath !== null) {
            if (typeof options.defaultPath !== 'string') {
                console.warn(`createJunction() expected a string for "defaultPath", but received "${typeof options.defaultPath}" instead.`)
            }

            if (options.defaultPath.indexOf(':') !== -1) {
                console.warn(`createJunction() expected an explictid path for "defaultPath", but received a path with a URL parameter "${options.defaultPath}".`)
            }

            let doesDefaultPathMatchPattern = false
            for (let i = 0; i < len; i++) {
                if (options.defaultPath.replace(compiledPatterns[i].relativeRegExp, '').length === 0) {
                    doesDefaultPathMatchPattern = true
                    break
                }
            }
            if (!doesDefaultPathMatchPattern) {
                console.warn(`createJunction() received a "defaultPath" value of "${options.defaultPath}", but this doesn't match any of the available patterns!`)
            }
        }

        // Check for missing mountables on patterns
        for (let i = 0; i < len; i++) {
            if (!compiledPatterns[i].mountable) {
                let pattern = compiledPatterns[i].relativePattern
                console.warn(`createJunction() received "${typeof compiledPatterns[i].mountable}" for pattern "${pattern}"!`)       
            }
        }

        // Check that a junction hasn't been supplied at "/", as the junction
        // could interfere with this junction.
        let indexPattern = compiledPatterns.find(pattern => pattern.relativeKey === '/')
        if (indexPattern) {
            // Note that if we receive a split, we can't check the type, as we
            // won't know it until the split is loaded. But the same rules
            // still apply!
            if (indexPattern.mountable.type === "Mountable" && indexPattern.mountable.mountableType === "Junction") {
                console.warn(`createJunction() received a Junction at the "/" pattern, but "/" must be a Page or a Redirect!`)
            }
        }
    }

    return class Junction extends JunctionMount<Children, Component, Payload> {
        static type = 'Mountable' as 'Mountable'
        static mountableType = 'Junction' as 'Junction'

        static children = options.children
        static payload = options.payload as Payload
        static component = options.component as Component
        static defaultPath = options.defaultPath || null

        static childCompiledPatterns = compiledPatterns

        constructor(mountOptions: MountOptions) {
            super({
                params: createParamsFromDefinition(options.params),
                ...mountOptions,
            }, Junction)
        }
    }
}


export function definePage<
    Component,
    Content,
    Meta
>(options: {
    params?: ParamsDefinition,
    title: string,
    component?: Component,
    meta?: Meta,
    getContent?: (helpers: {
        getPages: JunctionManager['getPages'],
        getJunctionPages: JunctionManager['getJunctionPages']
    }) => Content | Promise<Content>
}): PageDefinition<Component, Content, Meta> {
    let getter: (junctionManager: JunctionManager) => Content | Promise<Content>
    if (options.getContent) {
        let getContent = options.getContent
        getter = (junctionManager: JunctionManager) =>
            getContent({
                getPages: junctionManager.getPages.bind(junctionManager),
                getJunctionPages: junctionManager.getJunctionPages.bind(junctionManager),
            })
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

    let asyncContent: AsyncContent<Content> = {
        type: 'Async',
        status: undefined,
        getter,
        value: <any>undefined
    }
        
    return class Page extends PageMount<Component, Content, Meta> {
        static type = 'Mountable' as 'Mountable'
        static mountableType = 'Page' as 'Page'

        static title = options.title
        static component = options.component as Component
        static meta = options.meta as Meta

        static asyncContent = asyncContent

        constructor(mountOptions: MountOptions) {
            super({
                params: createParamsFromDefinition(options.params),
                ...mountOptions,
            }, Page)
        }
    }
}


export function defineRedirect(to: Location | string | ((location: Location) => Location)): RedirectDefinition {
    let toLocation =
        typeof to === 'string'
            ? { pathname: to }
            : to

    return class Redirect extends RedirectMount {
        static type = 'Mountable' as 'Mountable'
        static mountableType = 'Redirect' as 'Redirect'

        static to = toLocation
        static component = <never>undefined

        constructor(mountOptions: MountOptions) {
            super({
                params: {},
                ...mountOptions,
            }, Redirect)
        }
    }
}



//
// Utils
//



type Helpers = {
    split: typeof split,
}

function split<M extends Definition>(getter: () => Promise<M> | M): AsyncDefinition<M> {
    return {
        type: 'Async',
        status: undefined,
        getter: getter,
        value: <any>undefined
    }
}

function compareStrings(a, b) {   
    return (a<b?-1:(a>b?1:0));  
}

type ParamsDefinition =
    string[] |
    {
        [name: string]: boolean
    }

function createParamsFromDefinition(params?: ParamsDefinition): { [name: string]: boolean } {
    let result = {} as { [name: string]: boolean }
    if (Array.isArray(params)) {
        for (let i = 0; i < params.length; i++) {
            result[params[i]] = false
        }
        return result
    }
    else {
        return params || {}
    }
}