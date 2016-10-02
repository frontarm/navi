const assert = require('assert')

const { LocatedRoute } = require('../lib/Routes')
const { createPathParser } = require('../lib/PathParser')
const { default: getRouteSetFromLocation } = require('../lib/getRouteSetFromLocation')

const JunctionSets = require('./fixtures/JunctionSets')


describe('getRouteSetFromLocation', function() {
  describe('when passed location with pathname only', function() {
    beforeEach(function() {
      this.junctionSet = JunctionSets.invoiceListScreen

      const parsePath = createPathParser(this.junctionSet)
      const baseLocation = {}
      const location = { pathname: '/invoice/test/attachments' }
      
      this.routeSet = getRouteSetFromLocation(parsePath, baseLocation, this.junctionSet, location)
    })

    it('returns an appropriate RouteSet', function() {
      assert.equal(this.routeSet.content.constructor, LocatedRoute, 'creates a LocatedRoute for known routes')
      assert.equal(this.routeSet.addModal, undefined, 'does not create a LocatedRoute for unknown routes')

      assert.equal(this.routeSet.content.branch, this.junctionSet.junctions.content.branches.invoice, 'selects the correct branch')
      assert.equal(this.routeSet.content.params.id, 'test', 'adds params to LocatedRoute')
      assert.equal(this.routeSet.content.data.component, 'invoiceScreen', 'adds data to LocatedRoute')

      assert.equal(this.routeSet.content.children.content.constructor, LocatedRoute, 'adds children to LocatedRoute')
    })

    it('creates an appropriate LocatedRoute', function() {
      const route = this.routeSet.content
      const childRoute = route.children.content

      assert.equal(route.baseLocation.pathname, '/invoice/test')
      assert.deepEqual(route.baseLocation.state.junctions, {})
      assert.equal(route.isRouteInPath, true)
      assert.deepEqual(route.junctionPath, ['content'])

      assert.equal(childRoute.baseLocation.pathname, '/invoice/test/attachments')
      assert.deepEqual(childRoute.baseLocation.state.junctions, {})
      assert.equal(childRoute.isRouteInPath, true)
      assert.deepEqual(childRoute.junctionPath, ['content', 'content'])
    })
  })

  describe('when passed location with state only', function() {
    beforeEach(function() {
      this.junctionSet = JunctionSets.invoiceListScreen

      const parsePath = createPathParser(this.junctionSet)
      const baseLocation = { pathname: '/some-other-path' }
      const location = { 
        pathname: '/some-other-path',
        state: {
          junctions: {
            'content': { branchKey: 'invoice', serializedParams: { id: 'test' } },
            'content/content': { branchKey: 'details', serializedParams: {} },
          }
        }
      }
      
      this.routeSet = getRouteSetFromLocation(parsePath, baseLocation, this.junctionSet, location)
    })

    it('returns a RouteSet', function() {
      assert.equal(this.routeSet.content.constructor, LocatedRoute, 'creates a LocatedRoute for known routes')
      assert.equal(this.routeSet.addModal, undefined, 'does not create a LocatedRoute for unknown routes')

      assert.equal(this.routeSet.content.branch, this.junctionSet.junctions.content.branches.invoice, 'selects the correct branch')
      assert.equal(this.routeSet.content.params.id, 'test', 'adds params to LocatedRoute')
      assert.equal(this.routeSet.content.data.component, 'invoiceScreen', 'adds data to LocatedRoute')

      assert.equal(this.routeSet.content.children.content.constructor, LocatedRoute, 'adds children to LocatedRoute')
    })

    it('creates an appropriate LocatedRoute', function() {
      const route = this.routeSet.content
      const childRoute = route.children.content

      assert.equal(route.baseLocation.pathname, '/some-other-path')
      assert.deepEqual(route.baseLocation.state.junctions, {
        'content': { branchKey: 'invoice', serializedParams: { id: 'test' } },
      })
      assert.equal(route.isRouteInPath, false)
      assert.deepEqual(route.junctionPath, ['content'])

      assert.equal(childRoute.baseLocation.pathname, '/some-other-path')
      assert.deepEqual(childRoute.baseLocation.state.junctions, {
        'content': { branchKey: 'invoice', serializedParams: { id: 'test' } },
        'content/content': { branchKey: 'details', serializedParams: {} },
      })
      assert.equal(childRoute.isRouteInPath, false)
      assert.deepEqual(childRoute.junctionPath, ['content', 'content'])
    })
  })

  it('selects default branches on known paths', function() {
    const junctionSet = JunctionSets.appScreen
    const parsePath = createPathParser(junctionSet)
    const baseLocation = { pathname: '/' }
    const location = { pathname: '/' }

    const routeSet = getRouteSetFromLocation(parsePath, baseLocation, junctionSet, location)

    const defaultRoute = routeSet.content.children.content

    assert.equal(defaultRoute.branch.key, 'list', 'selects a default branch')
  })

  it('returns null when an unknown path is received')

  it('ignores the pathname part of baseLocation', function() {
    const junctionSet = JunctionSets.invoiceListScreen
    const parsePath = createPathParser(junctionSet)
    const baseLocation = { pathname: '/mountpoint' }
    const location = { pathname: '/mountpoint/invoice/test' }

    const routeSet = getRouteSetFromLocation(parsePath, baseLocation, junctionSet, location)

    assert.equal(routeSet.content.branch, junctionSet.junctions.content.branches.invoice, 'selects the correct branch')
  })
})
