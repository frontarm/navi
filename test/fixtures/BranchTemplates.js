const { Branch } = require('../../lib')
const ParamTypes = require('./ParamTypes')


module.exports = {
  get details() {
    return Branch({ default: true })
  },

  get attachment() {
    return Branch({
      path: '/attachment/:attachmentId',
      paramTypes: {
        attachmentId: ParamTypes.id,
      },
      data: { component: 'component' },
    })
  },
}
