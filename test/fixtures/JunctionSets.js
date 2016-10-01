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
        invoice: Branch({
          data: {
            component: 'invoiceScreen'
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
    }, 'content')
  }
}
