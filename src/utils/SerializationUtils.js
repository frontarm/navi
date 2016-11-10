export function deserializeParams(paramTypes, params) {
  const deserializedParams = {}
  const keys = Object.keys(params)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    const serializer = paramTypes[key].serializer
    const serializedValue = params[key]
    deserializedParams[key] = decodeURIComponent(serializer.deserialize(serializedValue))
  }
  return deserializedParams
}

export function serializeParams(paramTypes, params) {
  const serializedParams = {}
  const keys = Object.keys(params)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    const serializedValue = encodeURIComponent(paramTypes[key].serializer.serialize(params[key]))
    if (serializedValue !== undefined) {
      serializedParams[key] = serializedValue
    }
  }
  return serializedParams
}
