const assert = require('assert')

const JunctionSet = require('../lib/JunctionSet').default
const Junctions = require('./fixtures/Junctions')


describe("JunctionSet", function() {
  it("accepts an object of junctions", function() {
    const junction = JunctionSet({
      abc123_: Junctions.invoiceScreenContent,
      b: Junctions.invoiceScreenContent,
    })

    assert(junction)
  })


  it("accepts single Junctions", function() {
    const junction = JunctionSet(Junctions.invoiceScreenContent)

    assert(junction.main)
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

  it("fails when the options object include as non-Junction value", function() {
    assert.throws(() => {
      JunctionSet({
        test: 'FAIL'
      })
    })
  })
})
