export default function joinPaths(a, b) {
  if (!b) {
    return a
  }
  if (a[a.length-1] === '/') {
    return a + b
  }
  return a + '/' + b
}
