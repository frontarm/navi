import hyphenize from './utils/hyphenize'
import { compilePattern } from './utils/PatternUtils'
import JunctionSet from './JunctionSet'
import { createParamType } from './Params'
import { createRoute } from './Routes'
import { isJunction } from './TypeGuards'


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


export default function createJunction(branchOptions) {
  const branches = {}
  const queryKeys = {}
  const branchKeys = Object.keys(branchOptions)
  let defaultKey

  if (branchKeys.length === 0) {
    throw new Error('Junction requires at least one BranchTemplate to be passed in')
  }

  if (branchKeys.createRoute !== undefined) {
    throw new Error('You cannot supply a branch named `createRoute` to `createJunction`, as it is a reserved name.')
  }

  for (let i = 0, len = branchKeys.length; i < len; i++) {
    const key = branchKeys[i]

    if (key.indexOf('#') !== -1) {
      throw new Error(`Junction keys may not use the character '#', but key was named "${key}".`)
    }

    const options = branchOptions[key] === true ? {} : branchOptions[key]

    const paramTypes = {}
    const paramNames = options.paramTypes ? Object.keys(options.paramTypes) : []
    for (let i = 0, len = paramNames.length; i < len; i++) {
      const paramName = paramNames[i]
      if (!/^[A-Za-z0-9_]+$/.test(paramName)) {
        throw new Error(`Branch param keys must only use the characters A-Z, a-z, 0-9 or _, but key was named "${paramName}".`)
      }
      paramTypes[paramName] = createParamType(options.paramTypes[paramName])
    }

    const pattern = options.path ? compilePattern(options.path, paramNames) : createDefaultPattern(key, paramTypes)

    if (!!options.intermediate && !options.next) {
      throw new Error('You cannot set a branch as intermediate without providing a `next` junction.')
    }

    const branch = {
      next: options.next && JunctionSet(options.next),
      data: Object.freeze(options.data || {}),
      intermediate: !!options.intermediate,
      default: !!options.default,
      key: key,
      paramTypes: paramTypes,
      pattern: pattern,
      queryKeys: Object.keys(paramTypes).filter(x => !pattern.paramNames.includes(x)),
    }

    if ('next' in options && options.next === undefined) {
      throw new Error(`Branch "${key}" was given a next propery, but its value was "undefined"`)
    }

    if (branch.next) {
      const childQueryKeys = branch.next.$$junctionSetMeta.queryKeys
      const duplicateKey = branch.queryKeys.find(x => childQueryKeys.includes(x))
      if (duplicateKey) {
        throw new Error(`The param "${duplicateKey}" was specified in branch "${key}" as well as one of its child branches`)
      }
    }

    if (branch.default) {
      if (defaultKey) {
        throw new Error(`Branch "${key}" was specified as default, when branch "${junctionMeta.defaultKey}" was already used as default.`)
      }
      defaultKey = key
    }

    for (let i = 0, len = branch.queryKeys.length; i < len; i++) {
      queryKeys[branch.queryKeys[i]] = true
    }
    
    branches[key] = Object.freeze(branch)
  }

  const patternIds =
    branchKeys.map(key => branches[key].pattern.parts.map(part => part === null ? ':' : part).concat('').join('/')).sort()
  for (let i = 1, len = patternIds.length; i < len; i++) {
    if (patternIds[i].indexOf(patternIds[i - 1]) === 0) {
      throw new Error(`Two branches have paths "${patternIds[i - 1]}" and "${patternIds[i]}" that match the same URLs!`)
    }
  }

  const junctionMeta = {
    branches: branches,
    branchKeys: branchKeys,
    branchValues: branchKeys.map(k => branches[k]),
    defaultKey: defaultKey,
    queryKeys: Object.keys(queryKeys),
  }

  Object.defineProperty(branches, '$$junctionMeta', { value: junctionMeta })
  Object.defineProperty(branches, 'createRoute', {
    value: (branchKey, params, ...next) => {
      const branch = branches[branchKey]

      if (branch === undefined) {
        throw new Error(`Could not create route as the key "${branchKey}" is not known.`)
      }

      return createRoute(branch, params, ...next)
    }
  })

  return Object.freeze(branches)
}
