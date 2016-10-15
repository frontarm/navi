const assert = require('assert')

const { Junction, Branch, Param, isJunction, isBranch, createRoute } = require('../lib')
const { Route, LocatedRoute } = require('../lib/Routes')
const JunctionSets = require('./fixtures/JunctionSets')


function makeBranch(options) {
  return Junction({ a: Branch(options) }).a
}


describe("Route", function() {
  it("adds static default parameters", function() {
    const route = new Route(makeBranch({
      params: {
        page: Param({ required: true, default: 1 })
      }
    }))
    assert.equal(route.params.page, 1)
  })

  it("adds dynamic default parameters", function() {
    const route = new Route(makeBranch({
      params: {
        page: Param({ required: true, default: () => 1 })
      }
    }))
    assert.equal(route.params.page, 1)
  })

  it("does not add default children", function() {
    const route = new Route(makeBranch({
      children: JunctionSets.invoiceScreen,
    }))
    assert.equal(route.children.main, null)
  })

  it("accepts parameters", function() {
    const branch = makeBranch({
      params: {
        page: Param({ default: () => 1 })
      }
    })
    const route = new Route(branch, { page: 2 })
    assert.equal(route.params.page, 2)
  })

  it("accepts children", function() {
    const children = JunctionSets.invoiceScreen
    const branch = makeBranch({ children: children })
    const route = new Route(branch, {}, { main: createRoute(children.main.details) })
    assert.equal(route.children.main.branch, children.main.details)
  })

  it("fails when missing required parameters", function() {
    assert.throws(() => {
      new Route(makeBranch({
        params: {
          id: Param({ required: true })
        }
      }))
    })
  })

  it("throws if given a Route with an unknown Branch", function() {
    const branch = makeBranch({ children: JunctionSets.invoiceScreen })
    
    assert.throws(() => {
      new Route(branch, {}, { main: Branch() })
    })
  })

  it("throws if locate is accessed", function() {
    const route = new Route(makeBranch())
    assert.throws(() => {
      route.locate
    })    
  })
})


describe("LocatedRoute#getLocation", function() {
  describe('for routes in path', function() {
    beforeEach(function() {
      this.branch = JunctionSets.invoiceListScreen.main.invoice
      this.route = new LocatedRoute(
        { pathname: '/mountpoint', query: {}, search: '' },
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
        main: createRoute(this.branch.children.main.details)
      })

      assert.equal(location.pathname, '/mountpoint/invoice/test-id/details')
      assert.equal(location.state.$$junctions.main, null)
    })

    it("generates appropriate locations when given a route", function() {
      const location = this.route.locate(
        createRoute(this.branch.children.main.details)
      )

      assert.equal(location.pathname, '/mountpoint/invoice/test-id/details')
      assert.equal(location.state.$$junctions.main, null)
    })
  })

  describe('for routes outside of path', function() {
    beforeEach(function() {
      this.branch = JunctionSets.invoiceListScreen.main.invoice
      this.route = new LocatedRoute(
        { pathname: '/mountpoint/something-else', query: {}, search: '' },
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
        main: createRoute(this.branch.children.main.details)
      })

      assert.equal(location.pathname, '/mountpoint/something-else')
      assert.deepEqual(location.state.$$junctions, {
        'main': { branchKey: 'invoice', serializedParams: { id: 'test-id' } },
        'main/main': { branchKey: 'details', serializedParams: {} },
      })
    })
  })
})
