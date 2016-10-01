export function deserializeParams(branchParams, routeParams) {
  const deserializedParams = {}
  const keys = Object.keys(routeParams)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    const serializer = branchParams[key].serializer
    const serializedValue = routeParams[key]
    deserializedParams[key] = serializer.deserialize(serializedValue)
  }
  return deserializedParams
}

export function serializeParams(branchParams, routeParams) {
  const serializedParams = {}
  const keys = Object.keys(routeParams)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    serializedParams[key] = branchParams[key].serializer.serialize(routeParams[key])
  }
  return serializedParams
}
