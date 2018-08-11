import { Location, parseQuery, stringifyQuery } from './Location'
import { Template, AsyncTemplate } from './Template'


export const KEY_WILDCARD = '\0'
export const KEY_WILDCARD_PATTERN = /\0/g


export interface CompiledPattern {
    // The relative path of a Junction to its parent, with wildcards
    // represented by a colon `:`, followed by the name of the param where
    // their value should be placed.
    relativePattern: string;
    
    // Like `key`, but without the parents path parts.
    relativeKey: string,

    // A regex that matches the relative pattern.
    // It should start with ^, but should not end with $.`
    relativeRegExp: RegExp,

    // The names of params that correspond to wildcards in the relative path.
    relativePathParams?: string[],

    template: Template | AsyncTemplate,
}

export interface MountedPattern extends CompiledPattern {
    // The names of all params, both search and path params, that are used
    // by this mount and its parents.
    params: string[],
    
    // Query parameters that are consumed regardless of their value,
    // where `true` indicates that they're required.
    relativeSearchParams?: string[],
}

export function createRootMountedPattern(template: Template, relativePath?: string): MountedPattern {
    let rootPattern: CompiledPattern =
        relativePath
            ? compilePattern(relativePath, template)
            : {
                relativePattern: relativePath || '',
                relativeKey: '',
                relativeRegExp: new RegExp(''),
                template
            }
        
    if (rootPattern.relativePathParams && rootPattern.relativePathParams.length > 0) {
        throw new Error("Your root path may not contain parameters")
    }

    return {
        ...rootPattern,
        params: [],
    }
}

export function compilePattern(pattern: string, template: Template | AsyncTemplate): CompiledPattern {
    let processedPattern = pattern
    if (processedPattern.length > 1 && processedPattern.substr(-1) === '/') {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`The pattern "${pattern}" ends with the character '/', so it has been automatically removed. To avoid this warning, don't add a final "/" to Junction patterns.`)
        }
        processedPattern = processedPattern.substr(0, processedPattern.length - 1)
    }
    if (processedPattern[0] !== '/') {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`The pattern "${pattern}" does not start with the character '/', so it has been automatically added. To avoid this warning, make sure to add the leading "/" to all Junction patterns.`)
        }
        processedPattern = '/'+processedPattern
    }
    if (/\/{2,}/.test(processedPattern)) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`The pattern "${pattern} has adjacent '/' characters, which have been combined into single '/' characters. To avoid this warning, don't use adjacent '/' characters within patterns.`)
        }
        processedPattern = processedPattern.replace(/\/{2,}/g, '/')
    }
    if (!/^([A-Za-z0-9\$\-_\.+!*'\(\),\/]|\/:)+$/.test(processedPattern)) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`The pattern "${pattern}" uses non-URL safe characters. The URL-safe characters are: A-Z a-z 0-9 $ - _ . + ! * ' ( ) ,`)
        }
    }
    
    if (processedPattern.length === 0) {
        throw new Error(`You cannot use an empty string "" as a Junction pattern!`)
    }
        
    let parts = processedPattern.split('/').slice(1)
    let pathParams: string[] = []
    let keyParts: string[] = []
    let regExpParts = ['^']
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i]
        if (part.length > 1 && part[0] === ':') {
            pathParams.push(part.slice(1))
            keyParts.push(KEY_WILDCARD)
            regExpParts.push('([^/]+)')
        }
        else {
            keyParts.push(part)
            regExpParts.push(escapeRegExp(part))
        }
    }
    
    return {
        relativePattern: processedPattern,
        relativeKey: keyParts.join('/'),
        relativePathParams: pathParams.length ? pathParams : undefined,
        relativeRegExp: new RegExp(regExpParts.join('/')),
        template: template,
    }
}


export function createChildMountedPattern(parentPattern: MountedPattern, compiledPattern: CompiledPattern): MountedPattern {
    if (process.env.NODE_ENV !== 'production') {
        if (compiledPattern.relativePathParams) {        
            let doubleParams = compiledPattern.relativePathParams.filter(param => parentPattern.params.indexOf(param) !== -1)
            if (doubleParams.length) {
                console.error(`The pattern "${compiledPattern.relativePattern}" uses the param names ${doubleParams.map(x => `"${x}"`).join(', ')}, which have already been used by a parent junction.`)
            }
        }
    }

    return {
        params: parentPattern.params.concat(compiledPattern.relativePathParams || []),
        ...compiledPattern,
    }
}


export function addParamsToMountedPattern(pattern: MountedPattern, params: string[]): MountedPattern {
    let relativeSearchParams = params || []
    
    // Ensure that any params in the mount's path are also specified by the
    // mounted junction's "params" config.
    if (pattern.relativePathParams) {
        for (let i = pattern.relativePathParams.length - 1; i >= 0; i--) {
            let pathParam = pattern.relativePathParams[i]
            let index = relativeSearchParams.indexOf(pathParam)
            if (index === -1) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn(`The path parameter ":${pathParam}" was not specified in its associated junctions' "params" configuration option. To avoid this warning, always specify your junctions' "params" object.`)
                }
            }
            else {
                relativeSearchParams.splice(index, 1)
            }
        }    
    }

    // If there are no search params, the mount won't chang
    if (relativeSearchParams.length === 0) {
        return pattern
    }
    
    // Ensure that none of our search param names are already used by parent
    // junctions.
    if (process.env.NODE_ENV !== 'production') {
        let doubleParams = relativeSearchParams.filter(param => pattern.params.indexOf(param) !== -1)
        if (doubleParams.length) {
            console.error(`The junction mounted at "${pattern.relativePattern}" uses the param names ${doubleParams.map(x => `"${x}"`).join(', ')}, which have already been used by a parent junction.`)
        }
    }
    
    return {
        ...pattern,
        relativeSearchParams: relativeSearchParams.length ? relativeSearchParams : undefined,
    }
}

export type PatternMatch = {
    params: { [name: string]: any },

    // The part of the location that was matched, including path and search params.
    matchedLocation: Location,

    // This should be empty if the match consumes the entire location.
    remainingLocation?: Location,
}


export function matchMountedPatternAgainstLocation(pattern: MountedPattern, location: Location): PatternMatch | undefined {
    let match = pattern.relativeRegExp.exec(location.pathname)
    let params = {}

    if (!match) {
        return
    }

    // Set path params using RegExp match
    if (pattern.relativePathParams) {
        for (let i = 0; i < pattern.relativePathParams.length; i++) {
            let paramName = pattern.relativePathParams[i]
            params[paramName] = match[i+1]
        }
    }

    let matchedQueryParts = {}
    let remainingQueryParts = parseQuery(location.search)
    if (pattern.relativeSearchParams) {
        for (let i = 0; i < pattern.relativeSearchParams.length; i++) {
            let paramName = pattern.relativeSearchParams[i]
            if (remainingQueryParts[paramName] !== undefined) {
                params[paramName] = remainingQueryParts[paramName]
                matchedQueryParts[paramName] = remainingQueryParts[paramName]
                delete remainingQueryParts[paramName]
            }
        }
    }

    let matchedLocation = {
        pathname: match[0],
        search: stringifyQuery(matchedQueryParts),
    }
    let remainingLocation = {
        pathname: location.pathname.slice(match[0].length),
        search: stringifyQuery(remainingQueryParts),
        hash: location.hash,
        state: location.state,
    }

    return {
        params: params,
        matchedLocation: matchedLocation,
        remainingLocation: remainingLocation.pathname !== '' ? remainingLocation : undefined
    }
}
    


// From http://stackoverflow.com/a/5306111/106302
// Originally from http://simonwillison.net/2006/Jan/20/escape/ (dead link)
function escapeRegExp(value) {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}