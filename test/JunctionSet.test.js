const assert = require('assert')

const { JunctionSet, isJunctionSet } = require('../lib/junctions')
const Junctions = require('./fixtures/Junctions')


describe("isJunctionSet", function() {
  it("returns false when passed an empty object", function() {
    assert(!isJunctionSet({}))
  })
})


describe("JunctionSet", function() {
  it("returns a JunctionSet", function() {
    const junction = JunctionSet({
      abc123_: Junctions.invoiceScreenmain,
      b: Junctions.invoiceScreenmain,
    })

    assert(isJunctionSet(junction))
  })


  it("fails when given no junctions", function() {
    assert.throws(() => {
      JunctionSet({})
    })
  })

  it("fails when the key contains the non-alphanumeric/underscore character '/'", function() {
    assert.throws(() => {
      JunctionSet({
        'joe/': Junctions.invoiceScreenmain,
      })
    })
  })
})
