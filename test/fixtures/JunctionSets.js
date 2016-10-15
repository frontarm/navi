const { JunctionSet, Junction, Branch, Param } = require('../../lib')
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
          params: {
            page: Param({ default: 1, serializer: Serializers.number }),
            pageSize: Param({ default: 20, serializer: Serializers.number }),
          }
        }),
        invoice: Branch({
          data: {
            component: 'invoiceScreen',
          },
          params: {
            id: Param({ required: true }),
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
          params: {
            admin: Param({ serializer: Serializers.flag }),
          },
          children: module.exports.invoiceListScreen,
        }),
      })
    })
  }
}
