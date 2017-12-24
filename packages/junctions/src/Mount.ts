import { Junction } from './Junction'
import { Location, parseQuery, stringifyQuery } from './Location'


const KEY_WILDCARD = '\0'
const KEY_WILDCARD_PATTERN = /\0/g


export interface Mount {
    // The absolute path of the junction, with path parameters replaced with
    // the null character `\0` (which I'll generally write as `*`)
    key: string,

    // The names of all params, both search and path params, that are used
    // by this mount and its parents.
    params: string[],
    
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

    // Query parameters that are consumed regardless of their value,
    // where `true` indicates that they're required.
    relativeSearchParams?: { [name: string]: boolean },
}


export const emptyMount = {
    key: '',
    params: [],
    relativePattern: '',
    relativeKey: '',
    relativeRegExp: new RegExp(''),
}


export function createChildMount(parentMount: Mount, pattern: string): Mount {
    let compiledPattern = compilePattern(pattern)

    if (process.env.NODE_ENV !== 'production') {
        if (compiledPattern.relativePathParams) {        
            let doubleParams = compiledPattern.relativePathParams.filter(param => parentMount.params.indexOf(param) !== -1)
            if (doubleParams.length) {
                console.error(`The pattern "${pattern}" uses the param names ${doubleParams.map(x => `"${x}"`).join(', ')}, which have already been used by a parent junction.`)
            }
        }
    }

    return {
        key: parentMount.key+'/'+compiledPattern.relativeKey,
        params: parentMount.params.concat(compiledPattern.relativePathParams || []),
        ...compiledPattern,
    }
}

function compilePattern(pattern: string) {
    let processedPattern = pattern
    if (processedPattern[0] !== '/') {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`The pattern "${pattern}" does not start with the character '/', so it has been automatically added. To avoid this warning, make sure to add the leading "/" to all Junction patterns.`)
        }
        processedPattern = '/'+processedPattern
    }
    if (processedPattern.substr(-1) === '/') {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`The pattern "${pattern}" ends with the character '/', so it has been automatically removed. To avoid this warning, don't add a final "/" to Junction patterns.`)
        }
        processedPattern = processedPattern.substr(0, processedPattern.length - 1)
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
        throw new Error(`You cannot use an empty string or single "/" character as a Junction pattern!`)
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
        relativeRegExp: new RegExp(regExpParts.join('/'))
    }
}

// From http://stackoverflow.com/a/5306111/106302
// Originally from http://simonwillison.net/2006/Jan/20/escape/ (dead link)
function escapeRegExp(value) {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

function createObjectOf(value: any, keys: string[]) {
    let result = {}
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = value
    }
    return result
}

export function addJunctionParamsToMount(mount: Mount, junctionParams?: Junction['params']): Mount {
    let relativeSearchParams =
        junctionParams ? (Array.isArray(junctionParams) ? createObjectOf(false, junctionParams) : junctionParams) : {}
    
    // Ensure that any params in the mount's path are also specified by the
    // mounted junction's "params" config.
    if (mount.relativePathParams) {
        for (let i = mount.relativePathParams.length - 1; i >= 0; i--) {
            let pathParam = mount.relativePathParams[i]
            let required = relativeSearchParams[pathParam]
            if (required === undefined) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn(`The path parameter ":${pathParam}" was not specified in its associated junctions' "params" configuration option. To avoid this warning, always specify your junctions' "params" object.`)
                }
            }
            else {
                delete relativeSearchParams[pathParam]
            }
        }    
    }

    // If there are no search params, the mount won't change.
    let searchParamKeys = Object.keys(relativeSearchParams)
    if (searchParamKeys.length === 0) {
        return mount
    }
    
    // Ensure that none of our search param names are already used by parent
    // junctions.
    if (process.env.NODE_ENV !== 'production') {
        let doubleParams = searchParamKeys.filter(param => mount.params.indexOf(param) !== -1)
        if (doubleParams.length) {
            console.error(`The junction mounted at "${mount.relativePattern}" uses the param names ${doubleParams.map(x => `"${x}"`).join(', ')}, which have already been used by a parent junction.`)
        }
    }
    
    return {
        ...mount,
        relativeSearchParams: searchParamKeys.length ? relativeSearchParams : undefined,
    }
}

type MountMatch = {
    params: { [name: string]: any },

    // The part of the location that was matched, including path and search params.
    matchedLocation: Location,

    // This should be empty if the match consumes the entire location.
    remainingLocation?: Location,
}


export function matchMountAgainstLocation(mount: Mount, location: Location): MountMatch | undefined {
    let match = mount.relativeRegExp.exec(location.pathname)
    let params = {}

    if (!match) {
        return
    }

    // Set path params using RegExp match
    if (mount.relativePathParams) {
        for (let i = 0; i < mount.relativePathParams.length; i++) {
            let paramName = mount.relativePathParams[i]
            params[paramName] = match[i+1]
        }
    }

    let matchedQueryParts = {}
    let remainingQueryParts = {}
    if (mount.relativeSearchParams) {
        let query = parseQuery(location.search)
        let keys = Object.keys(mount.relativeSearchParams)
        for (let i = 0; i < keys.length; i++) {
            let paramName = keys[i]
            let isRequired = mount.relativeSearchParams[paramName]

            if (query[name] === undefined) {
                // If the parameter is required but not present, then this is not
                // a match.
                if (isRequired) {
                    return
                }
            }
            else {
                params[paramName] = query[name]
                matchedQueryParts[paramName] = query[name]
                delete query[name]
            }
        }
        remainingQueryParts = query
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
        remainingLocation: !(remainingLocation.pathname === '' || remainingLocation.pathname === '/') || remainingLocation.search !== '' ? remainingLocation : undefined
    }
}
    

export function validateChildMounts(childMounts: Mount[]) {
    if (process.env.NODE_ENV !== 'production') {
        if (childMounts.length < 2) {
            return
        }

        // Note that the patterns are reverse ordered by keys, and the wildcard character
        // is the null character `\0`, so wildcards always appear after any
        // specific alternatives.
        let len = childMounts.length
        let previousMount = childMounts[len - 1]
        for (let i = len - 2; i >= 0; i--) {
            let mount = childMounts[i]

            // If previous pattern matches this one, and doesn't completely
            // replace it, then there could be a conflict
            let replacedKey = mount.relativeKey.replace(previousMount.relativeRegExp, '')
            if (replacedKey !== mount.relativeKey && replacedKey.length > 0) {
                console.warn(`A junction defines children at both "${previousMount.relativePattern}" and "${mount.relativePattern}", but this may lead to multiple junctions sharing the same URL.`)
            }

            previousMount = mount
        }
    }
}


