export default function select(obj, params, included=true) {
  const selected = {}
  const keys = Object.keys(obj)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    const index = params.indexOf(key)
    if (included ? (index !== -1) : (index === -1)) {
      selected[key] = obj[key]
    }
  }
  return selected
}
