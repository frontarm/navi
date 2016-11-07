const assert = require('assert')

const { JunctionSet } = require('../lib/Declarations')
const Junctions = require('./fixtures/Junctions')


describe("JunctionSet", function() {
  it("returns a JunctionSet", function() {
    const junction = JunctionSet({
      abc123_: Junctions.invoiceScreenContent,
      b: Junctions.invoiceScreenContent,
    })

    assert(junction)
  })


  it("fails when given no junctions", function() {
    assert.throws(() => {
      JunctionSet({})
    })
  })

  it("fails when the key contains the non-alphanumeric/underscore character '/'", function() {
    assert.throws(() => {
      JunctionSet({
        'joe/': Junctions.invoiceScreenContent,
      })
    })
  })
})
