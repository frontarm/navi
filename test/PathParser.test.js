const assert = require('assert')

const { createPathParser } = require('../lib/PathParser')
const JunctionSets = require('./fixtures/JunctionSets')


describe('createPathParser', function() {
  it("returns a function given a JunctionSet", function() {
    const parsePath = createPathParser(JunctionSets.invoiceListScreen)

    assert.equal(typeof parsePath, 'function', "createPathParser returns a function")
  })
})


describe('parsePath', function() {
  it("converts a primary paths to a map of tree nodes", function() {
    const parsePath = createPathParser(JunctionSets.invoiceListScreen)

    assert.deepEqual(parsePath('/invoice/test'), {
      'content': { branchKey: 'invoice', serializedParams: { id: 'test' }, routePath: 'invoice/test' }
    })

    assert.deepEqual(parsePath('/invoice/test/details'), {
      'content': { branchKey: 'invoice', serializedParams: { id: 'test' }, routePath: 'invoice/test' },
      'content/content': { branchKey: 'details', serializedParams: {}, routePath: 'invoice/test/details' },
    })
  })

  it("ignores non-primary paths", function() {
    const parsePath = createPathParser(JunctionSets.invoiceListScreen)

    assert.equal(parsePath('/open'), undefined)
  })

  it("returns null on partial matches", function() {
    const parsePath = createPathParser(JunctionSets.invoiceListScreen)

    assert.equal(parsePath('/invoice'), null)
  })
})
