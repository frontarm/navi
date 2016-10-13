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
      'main': { branchKey: 'invoice', serializedParams: { id: 'test' }, routePath: 'invoice/test', queryParts: {} }
    })

    assert.deepEqual(parsePath('/list', { page: '2' }), {
      'main': { branchKey: 'list', serializedParams: { page: '2' }, routePath: 'list', queryParts: { page: '2' } }
    })

    assert.deepEqual(parsePath('/invoice/test/details'), {
      'main': { branchKey: 'invoice', serializedParams: { id: 'test' }, routePath: 'invoice/test', queryParts: {} },
      'main/main': { branchKey: 'details', serializedParams: {}, routePath: 'invoice/test/details', queryParts: {} },
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
