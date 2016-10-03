const assert = require('assert')

const { createPathParser } = require('../lib/PathParser')
const { JunctionSet, Junction, Branch, Param, Serializer } = require('../lib/junctions')
const { default: getLocationFromRouteSet } = require('../lib/getLocationFromRouteSet')
const { default: getRouteSetFromLocation } = require('../lib/getRouteSetFromLocation')
const Serializers = require('./fixtures/Serializers')


describe('Integration: ', function() {
  beforeEach(function() {
    const invoiceScreen = JunctionSet({
      content: Junction({
        details: Branch(),
        attachments: Branch(),
      }, 'details')
    }, 'content')

    const invoiceListScreen = JunctionSet({
      content: Junction({
        invoice: Branch({
          path: '/:id',
          params: {
            id: Param({ required: true }),
          },
          children: invoiceScreen,
        }),
      }),
      addModal: Junction({
        open: Branch(),
      }),
    }, 'content')

    const appScreen = JunctionSet({
      content: Junction({
        dashboard: Branch(),
        invoices: Branch({
          params: {
            page: Param({ default: 1, serializer: Serializers.number }),
          },
          children: invoiceListScreen,
        }),
      }, 'dashboard')
    }, 'content')

    this.junctionSet = appScreen
    this.baseLocation = {
      pathname: '/mountpoint',
      state: {
        lessAwesomeRouter: true,
      },
      query: {}
    }
    this.parsePath = createPathParser(this.junctionSet)
  })

  it('getLocationFromRouteSet reverts the result of getRouteSetFromLocation', function() {
    const location = {
      pathname: '/mountpoint/invoices/1/abc123/details',
      state: {
        $$junctions: {
          'content/addModal': { branchKey: 'open', serializedParams: {} },
        },
      },
      query: {}
    }
    
    const routeSet = getRouteSetFromLocation(this.parsePath, this.baseLocation, this.junctionSet, location)
    const reverseLocation = getLocationFromRouteSet(this.baseLocation, true, [], this.junctionSet, routeSet)

    assert.equal(location.pathname, reverseLocation.pathname)
    assert.deepEqual(location.state.$$junctions, reverseLocation.state.$$junctions)
  })
})
