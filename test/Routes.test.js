const assert = require('assert')

const { createJunction, isJunction, isBranch } = require('../lib')
const { createRoute, Route, LocatedRoute } = require('../lib/Routes')
const JunctionSets = require('./fixtures/JunctionSets')


function makeBranch(options={}) {
  return createJunction({ a: options }).a
}


describe("Route", function() {
  it("throws if locate is called", function() {
    const route = new Route(makeBranch())
    assert.throws(() => {
      route.locate()
    })    
  })
})


describe("createRoute", function() {
  it("accepts children", function() {
    const children = JunctionSets.invoiceScreen
    const branch = makeBranch({ children: children })
    const route = createRoute(branch, {}, children.main.createRoute('details'))
    assert.equal(route.children.branch, children.main.details)
  })

  it("fails when missing required parameters", function() {
    assert.throws(() => {
      createRoute(makeBranch({
        paramTypes: {
          id: { required: true }
        }
      }))
    })
  })

  it("throws if given a Route with an unknown Branch", function() {
    const branch = makeBranch({ children: JunctionSets.invoiceScreen })
    
    assert.throws(() => {
      createRoute(branch, {}, 'FAIL')
    })
  })
})


describe("LocatedRoute#getLocation", function() {
  describe('for routes in path', function() {
    beforeEach(function() {
      // TODO: take into account the fact that LocatedRoute no longer generates base locations
      this.branch = JunctionSets.invoiceListScreen.main.invoice
      this.route = new LocatedRoute(
        { pathname: '/mountpoint/invoice/test-id', query: {}, search: '' },
        true,
        ['main'],
        this.branch,
        { id: 'test-id' },
        {}
      )
    })

    it("generates appropriate locations when not given a routeSet", function() {
      const location = this.route.locate()

      assert.equal(location.pathname, '/mountpoint/invoice/test-id')
      assert.equal(location.state, null)
    })

    it("generates appropriate locations when given as routeSet", function() {
      const location = this.route.locate({
        main: this.branch.children.main.createRoute('details')
      })

      assert.equal(location.pathname, '/mountpoint/invoice/test-id/details')
      assert.equal(location.state.$$junctions.main, null)
    })

    it("generates appropriate locations when given a route", function() {
      const location = this.route.locate(
        this.branch.children.main.createRoute('details')
      )

      assert.equal(location.pathname, '/mountpoint/invoice/test-id/details')
      assert.equal(location.state.$$junctions.main, null)
    })
  })

  describe('for routes outside of path', function() {
    beforeEach(function() {
      this.branch = JunctionSets.invoiceListScreen.main.invoice
      this.route = new LocatedRoute(
        { pathname: '/mountpoint/something-else', query: {}, search: '', state: { $$junctions: {
          'main': { branchKey: 'invoice', serializedParams: { id: 'test-id' } },
        } } },
        false,
        ['main'],
        this.branch,
        { id: 'test-id' },
        {}
      )
    })

    it("generates appropriate locations when not given a routeSet", function() {
      const location = this.route.locate()

      assert.equal(location.pathname, '/mountpoint/something-else')
      assert.deepEqual(location.state.$$junctions, {
        'main': { branchKey: 'invoice', serializedParams: { id: 'test-id' } },
      })
    })

    it("generates appropriate locations when given as routeSet", function() {
      const location = this.route.locate({
        main: this.branch.children.main.createRoute('details')
      })

      assert.equal(location.pathname, '/mountpoint/something-else')
      assert.deepEqual(location.state.$$junctions, {
        'main': { branchKey: 'invoice', serializedParams: { id: 'test-id' } },
        'main/main': { branchKey: 'details', serializedParams: {} },
      })
    })
  })
})
