const { Serializer } = require('../../lib/junctions')


function serializeNumber(number) {
  return ""+number
}

function deserializeNumber(string) {
  return parseFloat(string)
}


module.exports = {
  get number() {
    return Serializer({
      serialize: serializeNumber,
      deserialize: deserializeNumber,
    })
  },
}
