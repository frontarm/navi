import { Matcher } from './Matcher'
import { joinPaths } from './URLTools'
import { NaviRequest } from './NaviRequest'

export const KEY_WILDCARD = '\0'
export const MEMO_KEY_PREFIX = '\0'

/**
 * An object that holds information about a path that can be matched
 * in *part* of a URL.
 */
export interface Mapping {
  /**
   * The relative path of a Map to its parent, with wildcards
   * represented by a colon `:`, followed by the name of the param where
   * their value should be placed.
   */
  pattern: string

  /**
   * A string where wildcards have been replaced with the null character
   * '\0', so that no two identical keys will match the same URL.
   */
  key: string

  /**
   * A regex that matches the path.
   * It should start with ^, but should not end with $.`
   */
  regExp: RegExp

  /**
   * The names of params that correspond to wildcards in the relative path.
   */
  pathParamNames?: string[]

  /**
   * The node that will be used to handle detailed matching of this path,
   * once a tentative match is found.
   */
  matcher: Matcher<any>
}

export function createRootMapping(
  matcher: Matcher<any>,
  rootPath: string = '',
): Mapping {
  return rootPath !== ''
    ? createMapping(rootPath, matcher)
    : {
        pattern: rootPath,
        key: '',
        regExp: new RegExp(''),
        matcher,
      }
}

export function createMapping(pattern: string, matcher: Matcher<any>): Mapping {
  let processedPattern = pattern
  if (processedPattern.length > 1 && processedPattern.substr(-1) === '/') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `The pattern "${pattern}" ends with the character '/', so it has been automatically removed. To avoid this warning, don't add a final "/" to patterns.`,
      )
    }
    processedPattern = processedPattern.substr(0, processedPattern.length - 1)
  }

  if (processedPattern[0] !== '/') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `The pattern "${pattern}" does not start with the character '/', so it has been automatically added. To avoid this warning, make sure to add the leading "/" to all patterns.`,
      )
    }
    processedPattern = '/' + processedPattern
  }

  if (/\/{2,}/.test(processedPattern)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `The pattern "${pattern} has adjacent '/' characters, which have been combined into single '/' characters. To avoid this warning, don't use adjacent '/' characters within patterns.`,
      )
    }
    processedPattern = processedPattern.replace(/\/{2,}/g, '/')
  }
  if (!/^([A-Za-z0-9\$\-_\.+!*'\(\),\/]|\/:)+$/.test(processedPattern)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `The pattern "${pattern}" uses non-URL safe characters. The URL-safe characters are: A-Z a-z 0-9 $ - _ . + ! * ' ( ) ,`,
      )
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
    } else {
      keyParts.push(part)
      regExpParts.push(escapeRegExp(part))
    }
  }

  return {
    key: keyParts.join('/'),
    matcher,
    pattern: processedPattern,
    pathParamNames: pathParams.length ? pathParams : undefined,
    regExp:
      processedPattern === '/' ? /^\/$/ : new RegExp(regExpParts.join('/')),
  }
}

export function matchAgainstPathname(
  request: NaviRequest,
  mapping: Mapping,
): NaviRequest | undefined {
  let match = mapping.regExp.exec(request.path || '/')
  if (!match) {
    return
  }

  let matchedPathname = match[0]
  let unmatchedPath = request.path.slice(matchedPathname.length) || ''

  if (unmatchedPath.length && unmatchedPath[0] !== '/') {
    return
  }

  // Set path params using RegExp match
  let params = request.params
  if (mapping.pathParamNames) {
    params = { ...request.params }
    for (let i = 0; i < mapping.pathParamNames.length; i++) {
      let paramName = mapping.pathParamNames[i]
      params[paramName] = match[i + 1]
    }
  }

  let mountpath = joinPaths(request.mountpath, matchedPathname) || '/'
  return {
    ...request,
    params,
    mountpath,
    path: unmatchedPath,
    url: unmatchedPath + request.search,
  }
}

// From http://stackoverflow.com/a/5306111/106302
// Originally from http://simonwillison.net/2006/Jan/20/escape/ (dead link)
function escapeRegExp(value) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}
