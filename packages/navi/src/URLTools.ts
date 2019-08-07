/**
 * An object that store the parts of a URL that can correspond to a
 * a specific screen within your application.
 */
export type URLDescriptor = {
  /**
   * The URL's pathname part, starting from the first `/`, and ending
   * before any search string.
   * 
   * E.g. `/documents/hidden/`
   */
  pathname: string,

  /**
   * The URL's query part, including any `?` character. When there
   * is no query, it defaults to an empty string.
   * 
   * E.g. `?q=pants`.
   */
  search: string,

  /**
   * The URL's hash part, including any `#` character. When there
   * is no hash, it defaults to an empty string.
   * 
   * E.g. `#top`.
   */
  hash: string,

  /**
   * An object containing string values of parameters extracted from
   * the `search` properties. Defaults to an empty object.
   */
  query: Params,

  hostname: string,

  /**
   * The full string URL. If this URL Descriptor was created from a
   * string that you passed in, then this will match your provided
   * string.
   */
  href: string,
}

export type TrailingSlashAction = 'add' | 'remove' | null

export type Params = {
  [name: string]: string
}

export interface URLDescriptorOptions {
  removeHash?: boolean
  trailingSlash?: TrailingSlashAction
}

const parsePattern = /((((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/
export function createURLDescriptor(urlOrDescriptor: string | Partial<URLDescriptor>, { removeHash = false, trailingSlash = null }: URLDescriptorOptions = {}): URLDescriptor {
  let hostname: string
  let pathname: string
  let query: Params
  let search: string
  let hash: string
  if (typeof urlOrDescriptor === 'string') {
    let matches = parsePattern.exec(urlOrDescriptor)
    if (!matches) {
        throw new Error("Couldn't parse the provided URL.")
    }
    hostname = ''
    pathname = modifyTrailingSlash(matches[2] || '', trailingSlash)
    search = matches[6] || ''
    query = parseQuery(search)
    hash = matches[7] || ''
  }
  else {
    hostname = urlOrDescriptor.hostname || ''
    pathname = modifyTrailingSlash(urlOrDescriptor.pathname || '', trailingSlash)
    query = urlOrDescriptor.query || (urlOrDescriptor.search ? parseQuery(urlOrDescriptor.search) : {})
    search = urlOrDescriptor.search || stringifyQuery(query)
    hash = urlOrDescriptor.hash || ''
  }
  return {
    hostname,
    pathname,
    query,
    search,
    hash: removeHash ? '' : hash,
    href: pathname+search+hash,
  }
}

export function parseQuery(queryString?: string, leadingCharacter='?'): Params {
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

function splitPath(path: string): string[] {
  if (path === '') {
    return []
  }
  return path.split('/')
}

// users/789/, profile      => users/789/profile/
// /users/123, .           => /users/123
// /users/123, ..          => /users
// /users/123, ../..       => /
// /a/b/c/d,   ../../one   => /a/b/one
// /a/b/c/d,   .././one/    => /a/b/c/one/
export function joinPaths(base: string, ...paths: string[]): string {
  let allSegments = splitPath(base)
  for (let i = 0; i < paths.length; i++) {
    allSegments.push(...splitPath(paths[i]))
  }

  let pathSegments: string[] = []
  let lastSegmentIndex = allSegments.length - 1
  for (let i = 0; i <= lastSegmentIndex; i++) {
    let segment = allSegments[i]
    if (segment === "..") {
      pathSegments.pop()
    }
    // Allow empty segments on the first and final characters, so that leading
    // and trailing slashes will not be affected.
    else if (segment !== '.' && (segment !== '' || i === 0 || i === lastSegmentIndex)) {
      pathSegments.push(segment)
    }
  }

  return pathSegments.join('/')
}

export function modifyTrailingSlash(pathname: string, action: 'add' | 'remove' | null): string {
  let hasTrailingSlash = pathname.slice(-1) === '/'
  if (action === 'add' && !hasTrailingSlash) {
    return pathname + '/'
  }
  else if (action === 'remove' && hasTrailingSlash && pathname.length > 1) {
    return pathname.slice(0, -1)
  }
  return pathname
}
