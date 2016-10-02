import { Route, LocatedRoute } from './Routes'
import { compilePattern } from './PatternUtils'
import hyphenize from './hyphenize'

import { createPathParser } from './PathParser'
import getLocationFromRouteSet from './getLocationFromRouteSet'
import getRouteSetFromLocation from './getRouteSetFromLocation'


export function createConverter(junctionSet) {
  const parsePath = createPathParser(junctionSet)

  return {
    getLocationFromRouteSet(baseLocation, routeSet) {
      return getLocationFromRouteSet(baseLocation, true, [], junctionSet, routeSet)
    },
    getRouteSetFromLocation(baseLocation, location) {
      return getRouteSetFromLocation(parsePath, baseLocation, junctionSet, location)
    },
  }
}


const IS_JUNCTION_SET = Symbol()
const IS_JUNCTION = Symbol()
const IS_BRANCH_TEMPLATE = Symbol()
const IS_BRANCH = Symbol()
const IS_SERIALIZER = Symbol()
const IS_PARAM = Symbol()


export function isJunctionSet(x) {
  return x instanceof Object && x[IS_JUNCTION_SET]
}
export function isJunction(x) {
  return x instanceof Object && x[IS_JUNCTION]
}
export function isBranchTemplate(x) {
  return x instanceof Object && x[IS_BRANCH_TEMPLATE]
}
export function isBranch(x) {
  return x instanceof Object && x[IS_BRANCH]
}
export function isSerializer(x) {
  return x instanceof Object && x[IS_SERIALIZER]
}
export function isParam(x) {
  return x instanceof Object && x[IS_PARAM]
}
export function isRoute(x) {
  return x instanceof Route
}
export function isLocatedRoute(x) {
  return x instanceof LocatedRoute
}


export function JunctionSet(junctions, primaryKey) {
  const junctionKeys = Object.keys(junctions)

  if (junctionKeys.length === 0) {
    throw new Error('JunctionSet requires at least one Junction to be passed in')
  }
  if (primaryKey && !junctions[primaryKey]) {
    throw new Error(`A JunctionSet was created with primary key "${primaryKey}", but no junction with that key was given.`)
  }

  for (let i = 0, len = junctionKeys.length; i < len; i++) {
    const key = junctionKeys[i]

    if (!/^[A-Za-z0-9_]+$/.test(key)) {
      throw new Error('JunctionSet keys must only use the characters A-Z, a-z, 0-9 or _')
    }
  }

  const junctionSet = {
    junctions,
    junctionKeys,
    primaryKey,
  }

  Object.defineProperty(junctionSet, IS_JUNCTION_SET, { value: true })

  return junctionSet
}


function createDefaultPattern(key, branchParams) {
  const id = hyphenize(key)
  const branchParamKeys = Object.keys(branchParams)
  const paramNames =
    branchParamKeys.filter(key => {
      const param = branchParams[key]
      return (param.required || param.default) && !param.hidden
    })
        
  return {
    id: id,
    parts: [id].concat(paramNames.map(x => null)),
    paramNames: paramNames,
  }
}

export function Junction(branchTemplates, defaultKey) {
  const branches = {}

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

    branch.key = key
    branch.pattern = branchTemplate.pattern || createDefaultPattern(key, branchTemplate.params)
    branch.data = branchTemplate.data
    branch.params = branchTemplate.params

    if (branchTemplate.children) {
      branch.children = branchTemplate.children
    }
    
    const patternId = branch.pattern.id
    if (patternIds[patternId]) {
      throw new Error(`Branch "${key}" uses a pattern with "${id}", but another pattern or alias already uses this identifier.`)
    }
    patternIds[patternId] = true

    Object.defineProperty(branch, IS_BRANCH, { value: true })

    branches[key] = Object.freeze(branch)
  }
    
  const junction = {
    branches,
    branchKeys,
    branchValues: branchKeys.map(k => branches[k]),
    defaultKey
  }

  Object.defineProperty(junction, IS_JUNCTION, { value: true })

  return Object.freeze(junction)
}


export function Branch(options = {}) {
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

  const branchTemplate = {
    pattern: options.path && compilePattern(options.path, paramNames),
    data: data,
    params: params,
  }

  if ('children' in options && !isJunctionSet(options.children)) {
    throw new Error(`A 'children' key was specified for a Branch, but no value was specified.`)
  }
  if (options.children) {
    if (!isJunctionSet(options.children)) {
      throw new Error(`The "children" option of a Branch must be a JunctionSet.`)
    }

    branchTemplate.children = options.children
  }

  Object.defineProperty(branchTemplate, IS_BRANCH_TEMPLATE, { value: true })

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
 * @param {boolean}         options.hidden      Forces storage in state instead of URL. If also required, prevents the route from being parsed from URLs
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
    hidden: options.hidden || false,
    serializer: options.serializer || nonEmptyStringSerialier,
  }

  Object.defineProperty(param, IS_PARAM, { value: true })

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

  Object.defineProperty(serializer, IS_SERIALIZER, { value: true })

  return serializer
}
