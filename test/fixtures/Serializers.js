const { Serializer } = require('../../lib')


module.exports = {
  get number() {
    return Serializer({
      serialize: function serializeNumber(number) {
        return ""+number
      },
      deserialize: function deserializeNumber(string) {
        return parseFloat(string)
      },
    })
  },

  get flag() {
    return Serializer({
      serialize: (value) => '',
      deserialize: (string) => true,
    })
  }
}
