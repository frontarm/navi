const { Junction } = require('../../lib')
const Branches = require('./Branches')


module.exports = {
  get invoiceScreenContent() {
    return Junction({
      details: Branches.details,
      attachment: Branches.attachment,
    })
  },

  get addInvoiceModal() {
    return Junction({
      open: true,
    })
  }
}
