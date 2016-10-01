export function compilePattern(path, availableParamNames) {
  if (/\/{2,}/.test(path)) {
    throw new Error(`Pattern "${path}" must not have adjacent "/" characters`)
  }
  if (path[0] !== '/') {
    throw new Error(`Pattern "${path}" must start with the "/" character`)
  }
  if (path[path.length - 1] === '/') {
    throw new Error(`Pattern "${path}" must not end with the "/" character`)
  }
  if (!/^([A-Za-z0-9\$\-_\.+!*'\(\),\/]|\/:)+$/.test(path)) {
    throw new Error(`Pattern "${path}" must be composed of the / character and the URL-safe characters: A-Z a-z 0-9 $ - _ . + ! * ' ( ) ,`)
  }

  const parts = path.split('/').slice(1)
  const id = parts[0][0] == ':' ? ':' : parts[0]
  const paramNames =
    parts
      .map((part, i) => part[0] == ':' && part.substr(1))
      .filter(x => x)

  for (let i = 0, len = paramNames.length; i < len; i++) {
    if (availableParamNames.indexOf(paramNames[i]) === -1) {
      throw new Error(`Pattern "${path}" refers to an unknown param "${paramNames[i]}"`)
    }
  }

  return {
    id,
    parts: parts.map(part => part[0] == ':' ? null : part),
    paramNames,
  }
}


export function formatPattern(pattern, params) {
  const paramValues = []
  for (let i = 0, len = pattern.paramNames.length; i < len; i++) {
    const name = pattern.paramNames[i]
    const value = params[name]
    if (!value) {
      throw new Error(`Required route param "${name}" was not found`)
    }
    paramValues.push(value)
  }
  if (Object.keys(params).length > pattern.paramNames.length) {
    throw new Error(`Unknown params passed to route. Known params: ${pattern.paramNames.join(', ')}. Received params: ${Object.keys(params).join(', ')}.`)
  }
  const parts = []
  for (let i = 0, len = pattern.parts.length; i < len; i++) {
    const part = pattern.parts[i]
    parts.push(part === null ? paramValues.shift() : part)
  }
  return parts.join('/')
}

