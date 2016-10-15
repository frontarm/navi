export default function omit(obj, params) {
  const selected = {}
  const keys = Object.keys(obj)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    if (params.indexOf(key) === -1) {
      selected[key] = obj[key]
    }
  }
  return selected
}
