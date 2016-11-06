const Serializers = require('./Serializers')


module.exports = {
  get id() {
    return {
      serializer: Serializers.number,
      required: true,
    }
  },

  get page() {
    return {
      serializer: Serializers.number,
      default: 1,
      required: true,
    }
  },

  get slug() {
    return {
      required: true,
    }
  },
}
