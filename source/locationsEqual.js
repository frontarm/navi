import objectsEqual from './utils/objectsEqual'


export default function locationsEqual(x, y) {
  if (x === y) return true

  return (
    x.pathname == y.pathname &&
    x.search == y.search &&
    objectsEqual(
      (x.state && x.state.$$junctions) || {},
      (y.state && y.state.$$junctions) || {},
      (x, y) => x.branchKey == y.branchKey && objectsEqual(x.serializedParams, y.serializedParams)
    )
  )
}
