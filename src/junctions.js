import { Route, LocatedRoute } from './Routes'
import { compilePattern } from './PatternUtils'
import { createSearch, parseSearch } from './SearchUtils'
import hyphenize from './hyphenize'
import objectsEqual from './objectsEqual'

import { createPathParser } from './PathParser'
import getLocationFromRouteSet from './getLocationFromRouteSet'
import getRouteSetFromLocation from './getRouteSetFromLocation'


export function createConverter(junctionSet) {
  const parsePath = createPathParser(junctionSet)

  return {
    getLocationFromRouteSet(routeSet, baseLocation={ pathname: '/' }) {
      const baseLocationWithQuery = Object.assign({}, baseLocation, { query: parseSearch(baseLocation.search) })
      const location = getLocationFromRouteSet(baseLocationWithQuery, true, [], junctionSet, routeSet)
      location.search = createSearch(location.query)
      delete location.query
      return Object.freeze(location)
    },
    getRouteSetFromLocation(location, baseLocation={ pathname: '/' }) {
      const baseLocationWithQuery = Object.assign({}, baseLocation, { query: parseSearch(baseLocation.search) })
      const locationWithQuery = Object.assign({}, location, { query: parseSearch(location.search) })
      return getRouteSetFromLocation(parsePath, baseLocationWithQuery, junctionSet, locationWithQuery)
    },
  }
}


export function locationsEqual(x, y) {
  if (x === y) return true

  return (
    x.pathname == y.pathname &&
    x.search == y.search &&
    objectsEqual(
      (x.state && x.state.$$junctions) || {},
      (y.state && y.state.$$junctions) || {},
      (x, y) => x.branchKey == y.branchKey && objectsEqual(x.serializedParams, y.serializedParams)
    )
  )
}


export function isJunctionSet(x) {
  return x instanceof Object && x.$$junctionSetMeta
}
export function isJunction(x) {
  return x instanceof Object && x.$$junctionMeta
}
export function isBranchTemplate(x) {
  return x instanceof Object && x.$$branchTemplate
}
export function isBranch(x) {
  return x instanceof Object && x.$$branch
}
export function isSerializer(x) {
  return x instanceof Object && x.$$serializer
}
export function isParam(x) {
  return x instanceof Object && x.$$param
}
export function isRoute(x) {
  return x instanceof Route
}
export function isLocatedRoute(x) {
  return x instanceof LocatedRoute
}


export function JunctionSet(_junctions, primaryKey) {
  if (primaryKey && !_junctions[primaryKey]) {
    throw new Error(`A JunctionSet was created with primary key "${primaryKey}", but no junction with that key was given.`)
  }

  const junctionKeys = Object.keys(_junctions)
  const junctions = {}
  const junctionSetMeta = {
    junctions,
    junctionKeys,
    primaryKey,
    queryKeys: primaryKey && _junctions[primaryKey].$$junctionMeta.queryKeys,
  }
  Object.defineProperty(junctions, '$$junctionSetMeta', { value: junctionSetMeta })
  Object.assign(junctions, _junctions)
  Object.freeze(junctions)

  if (junctionKeys.length === 0) {
    throw new Error('JunctionSet requires at least one Junction to be passed in')
  }
  
  for (let i = 0, len = junctionKeys.length; i < len; i++) {
    const key = junctionKeys[i]

    if (!/^[A-Za-z0-9_]+$/.test(key)) {
      throw new Error(`JunctionSet keys must only use the characters A-Z, a-z, 0-9 or _. See key "${key}"`)
    }
  }

  return junctions
}


function createDefaultPattern(key, branchParams) {
  const id = hyphenize(key)
  const branchParamKeys = Object.keys(branchParams)
  const paramNames =
    branchParamKeys.filter(key => {
      const param = branchParams[key]
      return param.required || param.default
    })
        
  return {
    id: id,
    parts: [id].concat(paramNames.map(x => null)),
    paramNames: paramNames,
  }
}

export function Junction(branchTemplates, defaultKey) {
  const junctionMeta = {}
  const branches = {}
  const queryKeys = {}
  Object.defineProperty(branches, '$$junctionMeta', { value: junctionMeta })

  if (defaultKey && !branchTemplates[defaultKey]) {
    throw new Error(`A Junction specified default key '${def}', but not Branch with that key exists.`)
  }

  const branchKeys = Object.keys(branchTemplates)

  if (branchKeys.length === 0) {
    throw new Error('Junction requires at least one BranchTemplate to be passed in')
  }

  const patternIds = {}
  for (let i = 0, len = branchKeys.length; i < len; i++) {
    const key = branchKeys[i]

    if (!/^[A-Za-z0-9_]+$/.test(key)) {
      throw new Error('Junction keys must only use the characters A-Z, a-z, 0-9 or _')
    }

    const branchTemplate = branchTemplates[key]

    if (!isBranchTemplate(branchTemplate)) {
      throw new Error(`An object was passed to Junction which is not a Branch. See key '${key}'.`)
    }

    const branch = (params={}, children={}) => Object.freeze(new Route(branch, params, children))
    const pattern = branchTemplate.pattern || createDefaultPattern(key, branchTemplate.params)

    branch.key = key
    branch.pattern = pattern
    branch.data = branchTemplate.data
    branch.params = branchTemplate.params
    branch.queryKeys = Object.keys(branch.params).filter(x => !pattern.paramNames.includes(x))

    for (let i = 0, len = branch.queryKeys.length; i < len; i++) {
      queryKeys[branch.queryKeys[i]] = true
    }

    if (branchTemplate.children) {
      const childQueryKeys = branchTemplate.children.$$junctionSetMeta.queryKeys
      const duplicateKey = branch.queryKeys.find(x => childQueryKeys.includes(x))
      if (duplicateKey) {
        throw new Error(`The param "${duplicateKey}" was specified in branches "${key}" as well as one of its child branches`)
      }

      branch.children = branchTemplate.children
    }
    
    const patternId = branch.pattern.id
    if (patternIds[patternId]) {
      throw new Error(`Branch "${key}" uses a pattern with "${id}", but another pattern or alias already uses this identifier.`)
    }
    patternIds[patternId] = true

    Object.defineProperty(branch, '$$branch', { value: true })

    branches[key] = Object.freeze(branch)
  }
    
  junctionMeta.branches = branches
  junctionMeta.branchKeys = branchKeys
  junctionMeta.branchValues = branchKeys.map(k => branches[k])
  junctionMeta.defaultKey = defaultKey
  junctionMeta.queryKeys = Object.keys(queryKeys)

  return Object.freeze(branches)
}


export function Branch(options = {}) {
  if ('children' in options && !isJunctionSet(options.children)) {
    throw new Error(`A 'children' key was specified for a Branch, but no value was specified.`)
  }

  const data = Object.freeze(options.data || {})
  const params = options.params || {}
  const paramNames = Object.keys(params)

  for (let i = 0, len = paramNames.length; i < len; i++) {
    const paramName = paramNames[i]
    if (!/^[A-Za-z0-9_]+$/.test(paramName)) {
      throw new Error(`Branch param keys must only use the characters A-Z, a-z, 0-9 or _, but key was named "${paramName}".`)
    }
    if (!isParam(params[paramName])) {
      throw new Error(`Branch params must be a value returned by the "Param" function.`)
    }
  }
  if (data !== undefined && typeof data !== 'object') {
    throw new Error(`If a Branch specifies a "data" option, it must be an Object. Instead, it was of type "${typeof data}".`)
  }

  const pattern = options.path && compilePattern(options.path, paramNames)

  const branchTemplate = {
    pattern: pattern,
    data: data,
    params: params,
  }

  if (options.children) {
    if (!isJunctionSet(options.children)) {
      throw new Error(`The "children" option of a Branch must be a JunctionSet.`)
    }

    branchTemplate.children = options.children
  }

  Object.defineProperty(branchTemplate, '$$branchTemplate', { value: true })

  return Object.freeze(branchTemplate)
}


const nonEmptyStringSerialier = Serializer({
  serialize: x => x || '',
  deserialize: x => x == '' ? null : x,
})

/**
 * Define a parameter which is available for all Routes through a specific branch.
 * 
 * @param {Object}          options
 * @param {function | any}  options.default     A default value, or function to generate one
 * @param {boolean}         options.required    Throw an error if a route is created without this param
 * @param {Serializer}      options.serializer  How to serialize/deserialize
 */
export function Param(options = {}) {
  if ('serializer' in options && !isSerializer(options.serializer)) {
    throw new Error (`Param expects the 'serializer' option to an object returned by junctions's Serializer function.`)
  }

  const param = {
    default: options.default,
    required: options.required || false,
    serializer: options.serializer || nonEmptyStringSerialier,
  }

  Object.defineProperty(param, '$$param', { value: true })

  return param
}


export function Serializer(options) {
  if (
    !options ||
    typeof options.serialize !== 'function' ||
    typeof options.deserialize !== 'function'
  ) {
    throw new Error(`A junctions Serializer must specify serialize, deserialize`)
  }

  const serializer = Object.assign({}, options)

  Object.defineProperty(serializer, '$$serializer', { value: true })

  return serializer
}
