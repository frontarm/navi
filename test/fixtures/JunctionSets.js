const { JunctionSet, Junction, Branch } = require('../../lib')
const Junctions = require('./Junctions')
const Serializers = require('./Serializers')


module.exports = {
  get invoiceScreen() {
    return JunctionSet({
      main: Junction({
        details: Branch({ default: true }),
        attachments: Branch(),
      })
    })
  },

  get invoiceListScreen() {
    return JunctionSet({
      main: Junction({
        list: Branch({
          default: true,
          path: '/list',
          paramTypes: {
            page: { default: 1, serializer: Serializers.number },
            pageSize: { default: 20, serializer: Serializers.number },
          }
        }),
        invoice: Branch({
          data: {
            component: 'invoiceScreen',
          },
          paramTypes: {
            id: { required: true },
          },
          children: module.exports.invoiceScreen,
        }),
      }),
      addModal: Junction({
        open: Branch(),
      }),
    })
  },

  get appScreen() {
    return JunctionSet({
      main: Junction({
        dashboard: Branch(),
        invoices: Branch({
          default: true,
          paramTypes: {
            admin: { serializer: Serializers.flag },
          },
          children: module.exports.invoiceListScreen,
        }),
      })
    })
  }
}
