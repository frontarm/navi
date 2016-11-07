const assert = require('assert')

const { createPathParser } = require('../lib/PathParser')
const { JunctionSet } = require('../lib/Declarations')
const { createJunction } = require('../lib')
const { default: getLocationFromRouteSet } = require('../lib/getLocationFromRouteSet')
const { default: getRouteSetFromLocation } = require('../lib/getRouteSetFromLocation')
const Serializers = require('./fixtures/Serializers')


describe('Integration: ', function() {
  beforeEach(function() {
    const invoiceScreen = JunctionSet({
      main: createJunction({
        details: {},
        attachments: {},
      }, 'details')
    })

    const invoiceListScreen = JunctionSet({
      main: createJunction({
        invoice: {
          path: '/:id',
          paramTypes: {
            id: { required: true },
          },
          children: invoiceScreen,
        },
      }),
      addModal: createJunction({
        open: {},
      }),
    })

    const appScreen = JunctionSet({
      main: createJunction({
        dashboard: { default: true },
        invoices: {
          paramTypes: {
            page: { default: 1, serializer: Serializers.number },
          },
          children: invoiceListScreen,
        },
      })
    })

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
          'main/addModal': { branchKey: 'open', serializedParams: {} },
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
