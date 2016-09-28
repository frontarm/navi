
export function Param(options = {}) {
  if (options.type && !options.type[IS_TYPE]) {
    throw new Error (`Param expects the 'type' option to an object returned by junctions's Type function.`)
  }

  const param = {
    default: options.default,
    required: options.required || false,
    hidden: options.hidden || false,
    type: options.type || nonEmptyStringType,
  }

  Object.defineProperty(param, IS_PARAM, { value: true })

  return param
}

function deserializeParams(paramTypes, params) {
  const deserializedParams = {}
  const keys = Object.keys(params)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    const type = paramTypes[key].type
    const serializedValue = params[key]
    deserializedParams[key] = type.exists(serializedValue) ? type.deserialize(serializedValue) : undefined
  }
  return deserializedParams
}

function serializeParams(paramTypes, params) {
  const serializedParams = {}
  const keys = Object.keys(params)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    serializedParams[key] = paramTypes[key].type.serialize(params[key])
  }
  return serializedParams
}


export function Type(options) {
  if (
    !options ||
    typeof options.serialize !== 'function' ||
    typeof options.deserialize !== 'function' ||
    typeof options.exists !== 'function'
  ) {
    throw new Error(`A junctions Param Type must specify serialize, deserialize and exists functions`)
  }

  const type = Object.assign({}, options)

  Object.defineProperty(type, IS_TYPE, { value: true })

  return type
}


const nonEmptyStringType = Type({
  serialize: x => x || '',
  deserialize: x => x == '' ? null : x,
  exists: x => x !== '',
})
