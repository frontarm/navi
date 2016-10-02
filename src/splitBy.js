export default function splitBy(obj, params) {
  const included = {}
  const excluded = {}
  const keys = Object.keys(obj)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    if (params.indexOf(key) === -1) {
      excluded[key] = obj[key]
    }
    else {
      included[key] = obj[key]
    }
  }
  return [included, excluded]
}
