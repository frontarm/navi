import hyphenize from './utils/hyphenize'
import { compilePattern } from './utils/PatternUtils'
import { isJunctionSet, isJunction, isBranchTemplate } from './TypeGuards'


export function JunctionSet(_junctions, _primaryKey) {
  const primaryKey = _primaryKey || (_junctions.main ? 'main' : undefined)

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


function createDefaultPattern(key, paramTypes) {
  const id = hyphenize(key)
  const branchParamKeys = Object.keys(paramTypes)
  const paramNames =
    branchParamKeys.filter(key => {
      const param = paramTypes[key]
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

    const branchTemplate = Branch(branchTemplates[key])

    if (branchTemplate.default) {
      if (junctionMeta.defaultKey) {
        throw new Error(`Branch "${key}" was specified as default, when branch "${junctionMeta.defaultKey}" was already used as default.`)
      }
      junctionMeta.defaultKey = key
    }

    const pattern = branchTemplate.pattern || createDefaultPattern(key, branchTemplate.paramTypes)
    const branch = {
      key: key,
      pattern: pattern,
      data: branchTemplate.data,
      paramTypes: branchTemplate.paramTypes,
      queryKeys: Object.keys(branchTemplate.paramTypes).filter(x => !pattern.paramNames.includes(x)),
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
  if (options === true) {
    return { data: {}, paramTypes: {}, pattern: false, default: false }
  }

  if ('children' in options && !isJunctionSet(options.children)) {
    throw new Error(`A 'children' key was specified for a Branch, but no value was specified.`)
  }

  const data = Object.freeze(options.data || {})
  const paramTypes = {}
  const paramNames = options.paramTypes ? Object.keys(options.paramTypes) : []

  for (let i = 0, len = paramNames.length; i < len; i++) {
    const paramName = paramNames[i]
    if (!/^[A-Za-z0-9_]+$/.test(paramName)) {
      throw new Error(`Branch param keys must only use the characters A-Z, a-z, 0-9 or _, but key was named "${paramName}".`)
    }
    paramTypes[paramName] = ParamType(options.paramTypes[paramName])
  }
  if (data !== undefined && typeof data !== 'object') {
    throw new Error(`If a Branch specifies a "data" option, it must be an Object. Instead, it was of type "${typeof data}".`)
  }

  const pattern = options.path && compilePattern(options.path, paramNames)

  const branchTemplate = {
    default: !!options.default,
    pattern: pattern,
    data: data,
    paramTypes: paramTypes,
  }

  if (options.children) {
    if (!isJunctionSet(options.children)) {
      throw new Error(`The "children" option of a Branch must be a JunctionSet.`)
    }

    branchTemplate.children = options.children
  }

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
export function ParamType(options = {}) {
  const serializer =
    (options !== true && 'serializer' in options)
      ? Serializer(options.serializer)
      : nonEmptyStringSerialier
  
  const param = {
    default: options.default,
    required: options.required || false,
    serializer: serializer,
  }

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

  return {
    serialize: options.serialize,
    deserialize: options.deserialize
  }
}
