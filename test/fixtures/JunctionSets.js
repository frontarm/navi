const { JunctionSet } = require('../../lib/junctions')
const Junctions = require('./Junctions')


module.exports = {
  get invoiceScreen() {
    return JunctionSet({
      content: Junctions.invoiceScreenContent,
      modal: Junctions.addInvoiceModal,
    }, 'content')
  },
}
