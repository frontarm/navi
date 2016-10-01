const assert = require('assert')

const { compilePattern, formatPattern } = require('../lib/PatternUtils')


describe('compilePattern', function() {
  it('creates a pattern from a path', function() {
    const pattern = compilePattern('/invoices/view/:invoiceId/attachments/:attachmentId', ['invoiceId', 'attachmentId', 'dummy'])

    assert.equal(pattern.id, 'invoices')
    assert.deepEqual(pattern.parts, ['invoices', 'view', null, 'attachments', null])
    assert.deepEqual(pattern.paramNames, ['invoiceId', 'attachmentId'])
  })

  it('throws when given an unrecognized param', function() {
    assert.throws(() => {
      compilePattern('/invoices/:invoiceId', ['dummy'])
    })
  })

  it('throws when path does not start with "/"', function() {
    assert.throws(() => {
      compilePattern('invoices/:invoiceId', ['invoiceId'])
    })
  })

  it('throws when path contains adjacent "/" characters', function() {
    assert.throws(() => {
      compilePattern('/invoices//:invoiceId', ['invoiceId'])
    })
  })

  it('throws when path contains the non-URL safe character "?"', function() {
    assert.throws(() => {
      compilePattern('/invoices?/:invoiceId', ['invoiceId'])
    })
  })

  it('throws when path contains a parameter marker in an unsupported position', function() {
    assert.throws(() => {
      compilePattern('/invoices/i:nvoiceId', ['invoiceId'])
    })
  })
})


const Patterns = {
  get invoiceId() {
    return compilePattern('/invoices/:invoiceId', ['invoiceId'])
  },
}

describe('formatPattern', function() {
  it('creates a path from a pattern', function() {
    const path = formatPattern(Patterns.invoiceId, {invoiceId: '5'})
    assert.equal(path, 'invoices/5')
  })

  it('throws when an unknown param is given', function() {
    assert.throws(() => {
      formatPattern(Patterns.invoiceId, {invoiceId: '5', dummy: '1'})
    })
  })

  it('throws when a required param is missing', function() {
    assert.throws(() => {
      formatPattern(Patterns.invoiceId, {})
    })
  })
})
