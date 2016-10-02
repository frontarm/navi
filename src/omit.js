export default function omit(obj, params) {
  const excluded = {}
  const keys = Object.keys(obj)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    if (params.indexOf(key) === -1) {
      excluded[key] = obj[key]
    }
  }
  return excluded
}
