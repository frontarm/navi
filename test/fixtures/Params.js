const { Param } = require('../../lib')
const Serializers = require('./Serializers')


module.exports = {
  get id() {
    return Param({
      serializer: Serializers.number,
      required: true,
    })
  },

  get page() {
    return Param({
      serializer: Serializers.number,
      default: 1,
      required: true,
    }) 
  },

  get slug() {
    return Param({
      required: true,
    }) 
  },
}
