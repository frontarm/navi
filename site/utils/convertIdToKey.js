function camelize(string) {
  return string.replace(/-(.)/g, (_, character) => character.toUpperCase())
}

export default function convertIdToKey(id) {
  return camelize(id.split('/').reverse()[0])
}
