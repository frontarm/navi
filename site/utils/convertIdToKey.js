function camelize(string) {
  return string.replace(/-(.)/g, (_, character) => character.toUpperCase())
}

export default function convertIdToKey(id) {
  return camelize(id.replace(/\.[a-zA-Z\.]+$/, '').split('/').reverse()[0])
}
