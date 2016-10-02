const assert = require('assert')

const { createPathParser } = require('../lib/PathParser')
const { default: getLocationFromRouteSet } = require('../lib/getLocationFromRouteSet')

const JunctionSets = require('./fixtures/JunctionSets')


describe('getLocationFromRouteSet', function() {
  it('returns correct location from a childless Route with path', function() {
    const junctionSet = JunctionSets.invoiceListScreen
    const route = junctionSet.junctions.content.branches.invoice({ id:'test-id' })
    const location = getLocationFromRouteSet({ pathname: '/' }, true, [], junctionSet, { content: route })
    
    assert.equal(location.pathname, '/invoice/test-id')
    assert.deepEqual(location.state.junctions, {})
  })

  it('returns correct location from a Route with children, path and baseLocation', function() {
    const baseLocation = {
      pathname: '/mountpoint',
      state: {
        someOtherLibrary: true,
      }
    }
    const junctionSet = JunctionSets.invoiceListScreen
    const contentRoute = junctionSet.junctions.content.branches.invoice({
      id:'test-id',
    }, {
      content: junctionSet.junctions.content.branches.invoice.children.junctions.content.branches.details(),
    })
    const modalRoute = junctionSet.junctions.addModal.branches.open()
    const routeSet = { content: contentRoute, addModal: modalRoute }
    const location = getLocationFromRouteSet(baseLocation, true, [], junctionSet, routeSet)
    
    assert.equal(location.pathname, '/mountpoint/invoice/test-id/details')
    assert.equal(location.state.someOtherLibrary, true)
    assert.deepEqual(location.state.junctions, {
      'addModal': { branchKey: 'open', serializedParams: {} },
    })
  })

  it('returns correct location from a childless Route without path', function() {
    const junctionSet = JunctionSets.invoiceListScreen
    const route = junctionSet.junctions.content.branches.invoice({ id:'test-id' })
    const location = getLocationFromRouteSet({ pathname: '/parent' }, false, ['parent'], junctionSet, { content: route })
    
    assert.equal(location.pathname, '/parent')
    assert.deepEqual(location.state.junctions, {
      'parent/content': { branchKey: 'invoice', serializedParams: { id: 'test-id' } },
    })
  })
})
