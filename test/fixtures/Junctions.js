const { Junction, Branch } = require('../../lib')
const BranchTemplates = require('./BranchTemplates')


module.exports = {
  get invoiceScreenContent() {
    return Junction({
      details: BranchTemplates.details,
      attachment: BranchTemplates.attachment,
    })
  },

  get addInvoiceModal() {
    return Junction({
      open: Branch(),
    })
  }
}
