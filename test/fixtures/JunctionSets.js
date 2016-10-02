const { JunctionSet, Junction, Branch, Param } = require('../../lib/junctions')
const Junctions = require('./Junctions')


module.exports = {
  get invoiceScreen() {
    return JunctionSet({
      content: Junction({
        details: Branch(),
        attachments: Branch(),
      }, 'details')
    }, 'content')
  },

  get invoiceListScreen() {
    return JunctionSet({
      content: Junction({
        list: Branch({}),
        invoice: Branch({
          data: {
            component: 'invoiceScreen',
          },
          params: {
            id: Param({ required: true }),
          },
          children: module.exports.invoiceScreen,
        }),
      }, 'list'),
      addModal: Junction({
        open: Branch(),
      }),
    }, 'content')
  },

  get appScreen() {
    return JunctionSet({
      content: Junction({
        dashboard: Branch(),
        invoices: Branch({
          children: module.exports.invoiceListScreen,
        }),
      }, 'invoices')
    })
  }
}
