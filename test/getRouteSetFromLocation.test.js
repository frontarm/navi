const assert = require('assert')

const { LocatedRoute } = require('../lib/Routes')
const { createPathParser } = require('../lib/PathParser')
const { default: getRouteSetFromLocation } = require('../lib/getRouteSetFromLocation')

const JunctionSets = require('./fixtures/JunctionSets')


describe('getRouteSetFromLocation', function() {
  it('returns a RouteSet given a location with pathname', function() {
    const junctionSet = JunctionSets.invoiceListScreen
    const parsePath = createPathParser(junctionSet)
    const baseLocation = {}
    const location = { pathname: '/invoice/test/details' }
    
    const routeSet = getRouteSetFromLocation(parsePath, baseLocation, junctionSet, location)

    assert.equal(routeSet.content.constructor, LocatedRoute, 'creates a LocatedRoute for known routes')
    assert.equal(routeSet.addModal, undefined, 'does not create a LocatedRoute for unknown routes')

    assert.equal(routeSet.content.branch, junctionSet.junctions.content.branches.invoice, 'selects the correct branch')
    assert.equal(routeSet.content.params.id, 'test', 'adds params to LocatedRoute')
    assert.equal(routeSet.content.data.component, 'invoiceScreen', 'adds data to LocatedRoute')

    assert.equal(routeSet.content.children.content.constructor, LocatedRoute, 'adds children to LocatedRoute')
  })

  it('returns a RouteSet given a location with junctions state', function() {
    const junctionSet = JunctionSets.invoiceListScreen
    const parsePath = createPathParser(junctionSet)
    const baseLocation = {}
    const location = { 
      state: {
        junctions: {
          'content': { branchKey: 'invoice', serializedParams: { id: 'test' }, routePath: 'invoice/test' },
          'content/content': { branchKey: 'details', serializedParams: {}, routePath: 'invoice/test/details' },
        }
      }
    }
    
    const routeSet = getRouteSetFromLocation(parsePath, baseLocation, junctionSet, location)

    assert.equal(routeSet.content.constructor, LocatedRoute, 'creates a LocatedRoute for known routes')
    assert.equal(routeSet.addModal, undefined, 'does not create a LocatedRoute for unknown routes')

    assert.equal(routeSet.content.branch, junctionSet.junctions.content.branches.invoice, 'selects the correct branch')
    assert.equal(routeSet.content.params.id, 'test', 'adds params to LocatedRoute')
    assert.equal(routeSet.content.data.component, 'invoiceScreen', 'adds data to LocatedRoute')

    assert.equal(routeSet.content.children.content.constructor, LocatedRoute, 'adds children to LocatedRoute')
  })

  it('selects default branches when necessary', function() {
    const junctionSet = JunctionSets.invoiceListScreen
    const parsePath = createPathParser(junctionSet)
    const baseLocation = {}
    const location = { pathname: '/invoice/test' }

    const routeSet = getRouteSetFromLocation(parsePath, baseLocation, junctionSet, location)

    const defaultRoute = routeSet.content.children.content

    assert.equal(defaultRoute.branch.key, 'details', 'selects a default branch')
  })

  it('ignores the pathname part of baseLocation', function() {
    const junctionSet = JunctionSets.invoiceListScreen
    const parsePath = createPathParser(junctionSet)
    const baseLocation = { pathname: '/mountpoint' }
    const location = { pathname: '/mountpoint/invoice/test' }

    const routeSet = getRouteSetFromLocation(parsePath, baseLocation, junctionSet, location)

    assert.equal(routeSet.content.branch, junctionSet.junctions.content.branches.invoice, 'selects the correct branch')
  })

  it('returns routes which can be used to create locations')
})
