export async function serializePromise(promise: Promise<any>): Promise<string> {
  try {
    let value = await promise
    return JSON.stringify({
      type: 'resolved',
      value,
    })
  }
  catch (error) {
    let ctr
    let value = error
    if (error instanceof Error) {
      ctr = 'Error'
      value = {}
      for (let key of Object.getOwnPropertyNames(error)) {
        value[key] = error[key]
      }
    }
    return JSON.stringify({
      type: 'rejected',
      value: error,
      ctr,
    })
  }
}

export async function deserializePromise(serializedPromise: string): Promise<any> {
  let { type, value, ctr } = JSON.parse(serializedPromise)
  if (type === 'resolved') {
    return value
  }
  else {
    if (ctr === 'Error') {
      let error = new Error()
      Object.assign(error, value)
      value = error
    }
    throw value
  }
}