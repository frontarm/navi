const assert = require('assert')

const { createPathParser } = require('../lib/PathParser')
const JunctionSet = require('../lib/JunctionSet').default
const { createJunction } = require('../lib')
const { default: getLocationFromRouteSet } = require('../lib/getLocationFromRouteSet')
const { default: getRouteSetFromLocation } = require('../lib/getRouteSetFromLocation')
const Serializers = require('./fixtures/Serializers')


describe('Integration: ', function() {
  beforeEach(function() {
    const invoiceScreen = JunctionSet(createJunction({
      details: {},
      attachments: {},
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
      addModal: createJunction({
        open: {},
      }),
    })

    const appScreen = JunctionSet(createJunction({
      dashboard: { default: true },
      invoices: {
        paramTypes: {
          page: { default: 1, serializer: Serializers.number },
        },
        next: invoiceListScreen,
      },
    }))

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
          'main#addModal': { branchKey: 'open', serializedParams: {} },
        },
      },
      query: {}
    }
    
    const route = getRouteSetFromLocation(this.parsePath, this.baseLocation, this.junctionSet, location)
    const reverseLocation = getLocationFromRouteSet(this.baseLocation, true, [], this.junctionSet, [route])

    assert.equal(location.pathname, reverseLocation.pathname)
    assert.deepEqual(location.state.$$junctions, reverseLocation.state.$$junctions)
  })
})
