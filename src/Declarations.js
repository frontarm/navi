import hyphenize from './utils/hyphenize'
import { compilePattern } from './utils/PatternUtils'
import { isJunctionSet, isJunction, isBranchTemplate, isParam, isSerializer } from './TypeGuards'


export function JunctionSet(_junctions) {
  const primaryKey = _junctions.main ? 'main' : undefined

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

    if (!isJunction(_junctions[key])) {
      throw new Error(`An object was passed to JunctionSet which is not a Junction. See key "${key}"`)
    }
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

export function Junction(branchTemplates) {
  const junctionMeta = {}
  const branches = {}
  const queryKeys = {}
  Object.defineProperty(branches, '$$junctionMeta', { value: junctionMeta })

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

    if (branchTemplate.default) {
      if (junctionMeta.defaultKey) {
        throw new Error(`Branch "${key}" was specified as default, when branch "${junctionMeta.defaultKey}" was already used as default.`)
      }
      junctionMeta.defaultKey = key
    }

    if (!isBranchTemplate(branchTemplate)) {
      throw new Error(`An object was passed to Junction which is not a Branch. See key '${key}'.`)
    }

    const pattern = branchTemplate.pattern || createDefaultPattern(key, branchTemplate.params)
    const branch = {
      key: key,
      pattern: pattern,
      data: branchTemplate.data,
      params: branchTemplate.params,
      queryKeys: Object.keys(branchTemplate.params).filter(x => !pattern.paramNames.includes(x)),
    }

    for (let i = 0, len = branch.queryKeys.length; i < len; i++) {
      queryKeys[branch.queryKeys[i]] = true
    }

    if (branchTemplate.children) {
      const childQueryKeys = branchTemplate.children.$$junctionSetMeta.queryKeys
      const duplicateKey = branch.queryKeys.find(x => childQueryKeys.includes(x))
      if (duplicateKey) {
        throw new Error(`The param "${duplicateKey}" was specified in branch "${key}" as well as one of its child branches`)
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
    default: !!options.default,
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
