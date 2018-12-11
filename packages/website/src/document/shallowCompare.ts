export function shallowCompare(a, b) {
  var aIsNull = a === null
  var bIsNull = b === null

  if (aIsNull !== bIsNull) return false

  var aIsArray = Array.isArray(a)
  var bIsArray = Array.isArray(b)

  if (aIsArray !== bIsArray) return false

  var aTypeof = typeof a
  var bTypeof = typeof b

  if (aTypeof !== bTypeof) return false
  if (flat(aTypeof)) return a === b

  return aIsArray
    ? shallowArray(a, b)
    : shallowObject(a, b)
}

function shallowArray(a, b) {
  var l = a.length
  if (l !== b.length) return false

  for (var i = 0; i < l; i++) {
    if (a[i] !== b[i]) return false
  }

  return true
}

function shallowObject(a, b) {
  var ka = 0
  var kb = 0

  for (var key in a) {
    if (
      a.hasOwnProperty(key) &&
      a[key] !== b[key]
    ) return false

    ka++
  }

  for (var key in b) {
    if (b.hasOwnProperty(key)) kb++
  }

  return ka === kb
}

function flat(type) {
  return (
    type !== 'function' &&
    type !== 'object'
  )
}