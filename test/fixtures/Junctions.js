const { Junction, Branch } = require('../../lib/junctions')
const BranchTemplates = require('./BranchTemplates')


module.exports = {
  get invoiceScreenContent() {
    return Junction({
      details: BranchTemplates.details,
      attachment: BranchTemplates.attachment,
    }, 'details')
  },

  get addInvoiceModal() {
    return Junction({
      open: Branch(),
    })
  }
}
