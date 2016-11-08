module.exports = {
  get number() {
    return {
      serialize: function serializeNumber(number) {
        return ""+number
      },
      deserialize: function deserializeNumber(string) {
        return parseFloat(string)
      },
    }
  },

  get flag() {
    return {
      serialize: (value) => value ? '' : undefined,
      deserialize: (string) => true,
    }
  }
}
