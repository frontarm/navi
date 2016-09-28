

const IS_JUNCTION = Symbol()
const IS_BRANCH_TEMPLATE = Symbol()
const IS_BRANCH = Symbol()
const IS_TYPE = Symbol()
const IS_PARAM = Symbol()

const JUNCTIONS_STATE = Symbol()

const DEFAULT_KEY = Symbol()
const PRIMARY_KEY = Symbol()


export function Junction(branchTemplates, def) {
  const junction = {}

  Object.defineProperty(junction, IS_JUNCTION, { value: true })

  if (def) {
    if (!branchTemplates[def]) {
      throw new Error(`A Junction specified default key '${def}', but not Branch with that key exists.`)
    }

    Object.defineProperty(junction, DEFAULT_KEY, { value: def })
  }

  const branchKeys = Object.keys(branchTemplates)
  const patternIds = {}
  for (let i = 0, len = branchKeys.length; i < len; i++) {
    const key = branchKeys[i]

    if (!/^[A-Za-z0-9_]+$/.test(key)) {
      throw new Error('Junction keys must only use the characters A-Z, a-z, 0-9 or _')
    }

    const branchTemplate = branchTemplates[key]

    if (!branchTemplate[IS_BRANCH_TEMPLATE]) {
      throw new Error(`An object was passed to Junction which is not a Branch. See key '${key}'.`)
    }

    const branch = (params={}, children={}) => {
      const route = new Route(branch, params, children)
      Object.freeze(route)
      return route
    }

    branch.key = key
    branch.pattern = branchTemplate.pattern || createDefaultPattern(key, branch.params)
    branch.aliases = branchTemplate.aliases
    branch.data = branchTemplate.data
    branch.paramTypes = branchTemplates.paramTypes

    if (branchTemplate.children) {
      branch.children = branchTemplate.children
    }
    
    const patterns = branchTemplate.aliases.concat(branch.pattern)
    for (let i = 0, len = patterns.length; i < len; i++) {
      const id = patterns[i].id
      if (patternIds[id]) {
        throw new Error(`Branch "${key}" uses a pattern or alias starting with "${id}", but another pattern or alias already uses this identifier.`)
      }
      patternIds[id] = true
    }

    Object.defineProperty(branch, IS_BRANCH, { value: true })

    junction[key] = Object.freeze(branch)
  }
    
  return Object.freeze(junction)
}


export function Branch(options = {}) {
  const data = Object.freeze(options.data || {})
  const paramTypes = options.paramTypes || {}
  const paramNames = Object.keys(paramNames)

  for (let i = 0, len = paramNames.length; i < len; i++) {
    if (!/A-Za-z0-9_/.test(paramNames[i])) {
      throw new Error(`Branch param keys must only use the characters A-Z, a-z, 0-9 or _`)
    }
  }
  if (data === undefined && typeof data !== 'object') {
    throw new Error(`If a Branch specifies a "data" option, it must be an Object. Instead, it was of type "${typeof data}".`)
  }
  if ('children' in options && !options.children) {
    throw new Error(`A 'children' key was specified for a Branch, but no value was specified.`)
  }

  const branchTemplate = {
    pattern: options.pattern && compilePattern(options.pattern, paramNames),
    aliases: options.aliases ? options.aliases.map((alias) => compilePattern(alias, paramNames)) : [],
    data: data,
    paramTypes: paramTypes,
  }

  if (options.children) {
    branchTemplate.children = options.children
  }

  Object.defineProperty(branchTemplate, IS_BRANCH_TEMPLATE, { value: true })

  return Object.freeze(branchTemplate)
}


export function getPrimaryJunctionKey(junctionSet) {
  return 'primaryJunction' in junctionSet ? junctionSet.primaryJunctionKey : Object.keys(junctionSet.junctions)[0]
}

