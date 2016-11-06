const { JunctionSet, Junction } = require('../../lib')
const Junctions = require('./Junctions')
const Serializers = require('./Serializers')


module.exports = {
  get invoiceScreen() {
    return JunctionSet({
      main: Junction({
        details: { default: true },
        attachments: true,
      })
    })
  },

  get invoiceListScreen() {
    return JunctionSet({
      main: Junction({
        list: {
          default: true,
          path: '/list',
          paramTypes: {
            page: { default: 1, serializer: Serializers.number },
            pageSize: { default: 20, serializer: Serializers.number },
          }
        },
        invoice: {
          data: {
            component: 'invoiceScreen',
          },
          paramTypes: {
            id: { required: true },
          },
          children: module.exports.invoiceScreen,
        },
      }),
      addModal: Junction({
        open: true,
      }),
    })
  },

  get appScreen() {
    return JunctionSet({
      main: Junction({
        dashboard: {},
        invoices: {
          default: true,
          paramTypes: {
            admin: { serializer: Serializers.flag },
          },
          children: module.exports.invoiceListScreen,
        },
      })
    })
  }
}
