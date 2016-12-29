export function createSearch(query) {
  const keys = Object.keys(query)

  if (keys.length === 0) {
    return ''
  }

  const parts = []
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    const value = query[key]
    parts.push(value === '' ? key : key+'='+encodeURIComponent(value))
  }

  return '?' + parts.join('&')
}


export function parseSearch(search) {
  if (!search || search[0] != '?') {
    return {}
  }

  const query = {}
  const queryParts = search.slice(1).split('&')
  for (let i = 0, len = queryParts.length; i < len; i++) {
    const x = queryParts[i].split('=')
    query[x[0]] = x[1] ? decodeURIComponent(x[1]) : ''
  }

  return query
}
