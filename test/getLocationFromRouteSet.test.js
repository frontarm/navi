const assert = require('assert')

const { createPathParser } = require('../lib/PathParser')
const { default: getLocationFromRouteSet } = require('../lib/getLocationFromRouteSet')

const JunctionSets = require('./fixtures/JunctionSets')


describe('getLocationFromRouteSet', function() {
  it('returns correct location from a childless Route with path', function() {
    const junctionSet = JunctionSets.invoiceListScreen
    const route = junctionSet.main.createRoute('invoice', { id:'test-id' })
    const location = getLocationFromRouteSet({ pathname: '/' }, true, [], junctionSet, { main: route })
    
    assert.equal(location.pathname, '/invoice/test-id')
    assert.deepEqual(location.state.$$junctions, {})
  })

  it('returns correct location from a Route with children, path and baseLocation', function() {
    const baseLocation = {
      pathname: '/mountpoint',
      state: {
        someOtherLibrary: true,
      }
    }
    const junctionSet = JunctionSets.invoiceListScreen
    const mainRoute = junctionSet.main.createRoute(
      'invoice',
      { id:'test-id' },
      junctionSet.main.invoice.children.main.createRoute('details')
    )
    const modalRoute = junctionSet.addModal.createRoute('open')
    const routeSet = { main: mainRoute, addModal: modalRoute }
    const location = getLocationFromRouteSet(baseLocation, true, [], junctionSet, routeSet)
    
    assert.equal(location.pathname, '/mountpoint/invoice/test-id/details')
    assert.equal(location.state.someOtherLibrary, true)
    assert.deepEqual(location.state.$$junctions, {
      'addModal': { branchKey: 'open', serializedParams: {} },
    })
  })

  it('returns correct location from a childless Route without path', function() {
    const junctionSet = JunctionSets.invoiceListScreen
    const route = junctionSet.main.createRoute('invoice', { id:'test-id' })
    const location = getLocationFromRouteSet({ pathname: '/parent' }, false, ['parent'], junctionSet, { main: route })
    
    assert.equal(location.pathname, '/parent')
    assert.deepEqual(location.state.$$junctions, {
      'parent/main': { branchKey: 'invoice', serializedParams: { id: 'test-id' } },
    })
  })

  it('adds search parameters when they differ from defaults', function() {
    const junctionSet = JunctionSets.appScreen
    const route = junctionSet.main.createRoute(
      'invoices',
      { admin: true },
      junctionSet.main.invoices.children.main.createRoute(
        'list',
        { pageSize: 10, page: 3}
      )
    )
    const location = getLocationFromRouteSet({ pathname: '/' }, true, [], junctionSet, { main: route })
    
    assert.strictEqual(location.query.pageSize, '10')
    assert.strictEqual(location.query.page, '3')
    assert.strictEqual(location.query.admin, '')
  })

  it('does not add search parameters when they equal a default value', function() {
    const junctionSet = JunctionSets.appScreen
    const route = junctionSet.main.createRoute(
      'invoices',
      {},
      junctionSet.main.invoices.children.main.createRoute(
        'list',
        { pageSize: 20, page: 1 }
      )
    )
    const location = getLocationFromRouteSet({ pathname: '/' }, true, [], junctionSet, { main: route })
    
    assert.deepEqual(location.query, {})
  })
})
  
