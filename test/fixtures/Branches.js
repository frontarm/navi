const { Branch } = require('../../lib')
const ParamTypes = require('./ParamTypes')


module.exports = {
  get details() {
    return { default: true }
  },

  get attachment() {
    return {
      path: '/attachment/:attachmentId',
      paramTypes: {
        attachmentId: ParamTypes.id,
      },
      data: { component: 'component' },
    }
  },
}
