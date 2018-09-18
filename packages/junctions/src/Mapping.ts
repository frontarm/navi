import { Location, joinPaths, parseQuery, stringifyQuery, concatLocations } from './Location'
import { Node, MaybeResolvableNode } from './Node'


export const KEY_WILDCARD = '\0'
export const KEY_WILDCARD_REGEXP = /\0/g


/**
 * An object that holds information about a path that can be matched
 * in *part* of a URL.
 */
export interface Mapping {
    /**
     * The relative path of a Junction to its parent, with wildcards
     * represented by a colon `:`, followed by the name of the param where
     * their value should be placed.
     */
    pattern: string,
    
    /**
     * A string where wildcards have been replaced with the null character
     * '\0', so that no two identical keys will match the same URL.
     */
    key: string,

    /**
     * A regex that matches the path.
     * It should start with ^, but should not end with $.`
     */
    regExp: RegExp,

    /**
     * The names of params that correspond to wildcards in the relative path.
     */
    pathParamNames?: string[],
    
    /**
     * Parameters that will be consumed from the query string if available.
     */
    searchParamNames?: string[],

    /**
     * The node that will be used to handle detailed matching of this path,
     * once a tentative match is found.
     */
    maybeResolvableNode: MaybeResolvableNode,
}

export interface AbsoluteMapping extends Mapping {
    // The pattern including ancestor patterns. This is useful for outputting
    // error messages.
    absolutePattern: string,

    // The Location object where this mapping has actually been placed,
    // excluding the mapping's pattern itself.
    parentLocation: Location,

    // The names of all params used by the mapping, including both search and
    // path params. This is used to generate warnings when multiple nodes
    // specify that they require the same param names.
    ancestorParamNames: string[],
}

export function createRootMapping(maybeResolvableNode: MaybeResolvableNode, rootPath: string = ''): AbsoluteMapping {
    let rootMapping: Mapping =
        rootPath !== ''
            ?   createMapping(rootPath, maybeResolvableNode)
            :   {
                    pattern: rootPath,
                    key: '',
                    regExp: new RegExp(''),
                    maybeResolvableNode,
                }
        
    if (rootMapping.pathParamNames && rootMapping.pathParamNames.length > 0) {
        throw new Error("Your root path may not contain parameters")
    }

    return {
        ...rootMapping,
        absolutePattern: rootPath,
        parentLocation: { pathname: '' },
        ancestorParamNames: [],
    }
}

export function createMapping(pattern: string, maybeResolvableNode: MaybeResolvableNode): Mapping {
    let processedPattern = pattern
    if (processedPattern.length > 1 && processedPattern.substr(-1) === '/') {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`The pattern "${pattern}" ends with the character '/', so it has been automatically removed. To avoid this warning, don't add a final "/" to patterns.`)
        }
        processedPattern = processedPattern.substr(0, processedPattern.length - 1)
    }

    // TODO: swap this so pattern should *not* start with '/'
    if (processedPattern[0] !== '/') {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`The pattern "${pattern}" does not start with the character '/', so it has been automatically added. To avoid this warning, make sure to add the leading "/" to all patterns.`)
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
        throw new Error(`You cannot use an empty string "" as a pattern!`)
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
        key: keyParts.join('/'),
        maybeResolvableNode: maybeResolvableNode,
        pattern: processedPattern,
        pathParamNames: pathParams.length ? pathParams : undefined,
        regExp: new RegExp(regExpParts.join('/')),
        // searchParamNames is not added here as the node might not have been
        // resolved yet, and they are stored on the node. Instead, add them
        // with `addParamNamesToMapping` once the node is available.
    }
}


export function createChildMapping(parentMapping: AbsoluteMapping, mapping: Mapping): AbsoluteMapping {
    let absolutePattern = joinPaths(parentMapping.absolutePattern, mapping.pattern)

    if (process.env.NODE_ENV !== 'production') {
        if (mapping.pathParamNames) {        
            let doubleParams = mapping.pathParamNames.filter(param => parentMapping.ancestorParamNames.indexOf(param) !== -1)
            if (doubleParams.length) {
                console.error(`The node at "${absolutePattern}" has claimed ownership of the param names ${doubleParams.map(x => `"${x}"`).join(', ')}, but they have already been consumed by a parent node.`)
            }
        }
    }

    return {
        absolutePattern,
        parentLocation: concatLocations(parentMapping.parentLocation),
        ancestorParamNames:
            parentMapping.ancestorParamNames
                .concat(parentMapping.pathParamNames || [])
                .concat(parentMapping.searchParamNames || []),

        ...mapping,
    }
}


/**
 * A node may not be loaded until *after* it's path has been defined. Once the
 * node *is* loaded, this function can be used to add its `paramNames` to its
 * Mapping object.
 * @param mapping
 * @param paramNames 
 */
export function addParamNamesToMapping(mapping: AbsoluteMapping, paramNames: string[]): AbsoluteMapping {
    let searchParamNames = paramNames || []

    // If any of the mapping's path params are specified in `paramNames`, then
    // remove them from `relativeSearchParams`.
    if (mapping.pathParamNames) {
        for (let i = mapping.pathParamNames.length - 1; i >= 0; i--) {
            let pathParam = mapping.pathParamNames[i]
            let index = searchParamNames.indexOf(pathParam)
            if (index !== -1) {
                searchParamNames.splice(index, 1)
            }
        }    
    }
    
    // If there are no search params, the Mapping object won't change
    if (searchParamNames.length === 0) {
        return mapping
    }
    
    // Ensure that none of our search param names have already been consumed
    // by ancestor junctions.
    if (process.env.NODE_ENV !== 'production') {
        let doubleParams = searchParamNames.filter(param => mapping.ancestorParamNames.indexOf(param) !== -1)
        if (doubleParams.length) {
            console.error(`The node at "${mapping.absolutePattern}" has claimed ownership of the param names ${doubleParams.map(x => `"${x}"`).join(', ')}, but they have already been consumed by a parent node.`)
        }
    }
    
    return {
        ...mapping,
        searchParamNames: searchParamNames.length ? searchParamNames : undefined,
    }
}

export type MappingMatch = {
    params: { [name: string]: any },

    // The full matched location
    matchedLocation: Location,

    // This should be empty if the match consumes the entire location.
    remainingLocation?: Location,
}


export function matchMappingAgainstLocation(mapping: AbsoluteMapping, location: Location): MappingMatch | undefined {
    let match = mapping.regExp.exec(location.pathname)
    let params = {}

    if (!match) {
        return
    }

    // Set path params using RegExp match
    if (mapping.pathParamNames) {
        for (let i = 0; i < mapping.pathParamNames.length; i++) {
            let paramName = mapping.pathParamNames[i]
            params[paramName] = match[i+1]
        }
    }

    let matchedQueryParts = {}
    let remainingQueryParts = parseQuery(location.search)
    if (mapping.searchParamNames) {
        for (let i = 0; i < mapping.searchParamNames.length; i++) {
            let paramName = mapping.searchParamNames[i]
            if (remainingQueryParts[paramName] !== undefined) {
                params[paramName] = remainingQueryParts[paramName]
                matchedQueryParts[paramName] = remainingQueryParts[paramName]
                delete remainingQueryParts[paramName]
            }
        }
    }

    let matchedLocationPart = {
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
        matchedLocation: concatLocations(mapping.parentLocation, matchedLocationPart),
        remainingLocation: remainingLocation.pathname !== '' ? remainingLocation : undefined
    }
}
    


// From http://stackoverflow.com/a/5306111/106302
// Originally from http://simonwillison.net/2006/Jan/20/escape/ (dead link)
function escapeRegExp(value) {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}