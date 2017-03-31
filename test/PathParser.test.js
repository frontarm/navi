const assert = require('assert')

const { createPathParser } = require('../lib/PathParser')
const JunctionSet = require('../lib/JunctionSet').default
const { createJunction } = require('../lib')
const JunctionSets = require('./fixtures/JunctionSets')
const Serializers = require('./fixtures/Serializers')


function getPathParser() {
  const invoiceScreen = JunctionSet(createJunction({
      details: {},
    }))

    const invoiceListScreen = JunctionSet({
      main: createJunction({
        invoice: {
          path: '/:id',
          paramTypes: {
            id: { required: true },
          },
          next: invoiceScreen,
        },
      }),
    })

    const appScreen = JunctionSet(createJunction({
      dashboard: { default: true },
      invoices: {
        intermediate: true,
        paramTypes: {
          page: { default: 1, serializer: Serializers.number },
        },
        next: invoiceListScreen,
      },
    }))

    return createPathParser(appScreen)
}


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
      'main#main': { branchKey: 'details', serializedParams: {}, routePath: 'invoice/test/details', queryParts: {} },
    })
  })

  it("handles multiple parameters", function() {
    const parsePath = getPathParser()

    assert.deepEqual(parsePath('/invoices/1/abc123/details'), {
      'main': { branchKey: 'invoices', serializedParams: { page: '1' }, routePath: 'invoices/1', queryParts: {} },
      'main#main': { branchKey: 'invoice', serializedParams: { id: 'abc123' }, routePath: 'invoices/1/abc123', queryParts: {} },
      'main#main#main': { branchKey: 'details', serializedParams: {}, routePath: 'invoices/1/abc123/details', queryParts: {} },
    })
  })

  it("handles both siblings", function() {
    const rootScreen = JunctionSet(createJunction({
      '/examples/import.mdx': {
        path: '/examples/import',
      },
      '/examples/tags.mdx': {
        path: '/examples/tags',
      },
    }))
    const parsePath = createPathParser(rootScreen)

    assert.deepEqual(parsePath('/examples/import'), {
      'main': { branchKey: '/examples/import.mdx', serializedParams: {}, routePath: 'examples/import', queryParts: {} },
    })
    assert.deepEqual(parsePath('/examples/tags'), {
      'main': { branchKey: '/examples/tags.mdx', serializedParams: {}, routePath: 'examples/tags', queryParts: {} },
    })
  })

  it("does not match intermediate paths", function() {
    const parsePath = getPathParser()

    assert.equal(undefined, parsePath('/invoices/1'))
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
