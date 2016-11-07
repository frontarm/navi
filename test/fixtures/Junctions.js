const { createJunction } = require('../../lib')
const Branches = require('./Branches')


module.exports = {
  get invoiceScreenContent() {
    return createJunction({
      details: Branches.details,
      attachment: Branches.attachment,
    })
  },

  get addInvoiceModal() {
    return createJunction({
      open: true,
    })
  }
}
