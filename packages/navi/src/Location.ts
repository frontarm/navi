/**
 * An object that store the parts of a URL that can correspond to a
 * a specific screen within your application.
 */
export type Location = {
    pathname: string,
    search?: string,
    hash?: string,
    state?: object,
}

export type Query = {
    [name: string]: any
}

export function concatLocations(firstLocation: Location | string, ...locations: (Location | string)[]): Location {
    let result = 
        typeof firstLocation === 'string'
            ? { pathname: firstLocation } as Location
            : firstLocation

    for (let i = 0; i < locations.length; i++) {
        let location = locations[i]
        if (typeof location === 'string') {
            location = parseLocationString(location)
        }
        result = {
            ...result,
            pathname: joinPaths(result.pathname, location.pathname),
            search: joinQueryStrings(result.search, location.search, '?'),
            hash: joinQueryStrings(result.hash, location.hash, '#'),
            state: result.state || location.state ? Object.assign({}, result.state, location.state) : undefined,
        }
    }
    return result
}
    
const parsePattern = /^((((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/
export function parseLocationString(locationString: string): Location {
    let matches = parsePattern.exec(locationString)
    if (!matches) {
        throw new Error("Tried to parse a non-URI object.")
    }
    return {
        pathname: matches[2],
        search: matches[6],
        hash: matches[7],
    }
}

export function joinPaths(a, b) {
    if (!b) {
        return a
    }
    if (a[a.length-1] === '/') {
        a = a.substr(0, a.length - 1)
    }
    if (b[0] === '/') {
        b = b.substr(1)
    }
    return a + '/' + b
}

function joinQueryStrings(left, right, leadingCharacter='?'): string {
    if (!left || left[0] !== leadingCharacter) {
        return right
    }
    if (!right || right[0] !== leadingCharacter) {
        return left
    }
    return leadingCharacter+left.slice(1)+'&'+right.slice(1)
}

export function createURL(location?: Location): string {
    if (!location) {
        return ''
    }
    return location.pathname+(location.search || '')+(location.hash || '')
}

export function parseQuery(queryString?: string, leadingCharacter='?'): Query {
    if (!queryString || queryString[0] != leadingCharacter) {
        return {}
    }

    let query = {}
    let queryParts = queryString.slice(1).split('&')
    for (let i = 0, len = queryParts.length; i < len; i++) {
        const x = queryParts[i].split('=')
        query[x[0]] = x[1] ? decodeURIComponent(x[1]) : ''
    }
    return query
}

export function stringifyQuery(query: { [name: string]: any }, leadingCharacter='?') {
    let keys = Object.keys(query)
    if (keys.length === 0) {
      return ''
    }
  
    let parts: string[] = []
    for (let i = 0, len = keys.length; i < len; i++) {
      let key = keys[i]
      let value = String(query[key])
      parts.push(value === '' ? key : key+'='+encodeURIComponent(value))
    }
  
    return leadingCharacter + parts.join('&')
  }