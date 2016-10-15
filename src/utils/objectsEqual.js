export default function objectsEqual(x, y, fn) {
  if (x === y) return true
  if (!x && !y) return true
  if ((x || y) && (!x || !y)) return false

  const xKeys = Object.keys(x)
  const yKeys = Object.keys(y)
  const len = xKeys.length

  if (yKeys.length !== len) return false

  xKeys.sort()
  yKeys.sort()

  for (let i = 0; i < len; i++) {
    if (xKeys[i] != yKeys[i]) return false
  }
  for (let i = 0; i < len; i++) {
    const key = xKeys[i]
    if (fn ? !fn(x[key], y[key]) : (x[key] !== y[key])) return false
  }

  return true
}
