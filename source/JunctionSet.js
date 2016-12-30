import { isJunction } from './TypeGuards'


const NODE_ENV = typeof process !== 'undefined' ? process.env.NODE_ENV : 'development'


export default function JunctionSet(options) {
  if (options.$$junctionSetMeta) return options

  const isSingle = isJunction(options)
  const primaryKey = (isSingle || options.main) ? 'main' : undefined
  const junctions = isSingle ? { main: options } : Object.assign({}, options)
  const junctionKeys = Object.keys(junctions)
  const junctionSetMeta = {
    junctions,
    junctionKeys,
    primaryKey,
    isSingle,
    queryKeys: primaryKey ? junctions[primaryKey].$$junctionMeta.queryKeys : []
  }
  Object.defineProperty(junctions, '$$junctionSetMeta', { value: junctionSetMeta })
  Object.freeze(junctions)

  if (NODE_ENV !== 'production' && !isSingle) {
    if (junctionKeys.length === 0) {
      throw new Error('JunctionSet requires at least one Junction to be passed in')
    }
    
    for (let i = 0, len = junctionKeys.length; i < len; i++) {
      const key = junctionKeys[i]

      if (!isJunction(junctions[key])) {
        throw new Error(`An object was passed to JunctionSet which is not a Junction. See key "${key}"`)
      }
      if (!/^[A-Za-z0-9_]+$/.test(key)) {
        throw new Error(`JunctionSet keys must only use the characters A-Z, a-z, 0-9 or _. See key "${key}"`)
      }
    }
  }

  return junctions
}
