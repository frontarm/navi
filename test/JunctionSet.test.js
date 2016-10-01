const assert = require('assert')

const { JunctionSet, isJunctionSet } = require('../lib/junctions')
const Junctions = require('./fixtures/Junctions')


describe("isJunctionSet", function() {
  it("returns false when passed an empty object", function() {
    assert(!isJunctionSet({}))
  })
})


describe("JunctionSet", function() {
  it("returns a JunctionSet when given no primary", function() {
    const junction = JunctionSet({
      abc123_: Junctions.invoiceScreenContent,
    })

    assert(isJunctionSet(junction))
  })

  it("returns a JunctionSet when given a primary", function() {
    const junction = JunctionSet({
      a: Junctions.invoiceScreenContent,
      b: Junctions.invoiceScreenContent,
    }, 'a')

    assert(isJunctionSet(junction))
  })


  it("fails when given no junctions", function() {
    assert.throws(() => {
      JunctionSet({})
    })
  })

  it("fails when given an unknown key for primary", function() {
    assert.throws(() => {
      JunctionSet({
        a: Junctions.invoiceScreenContent,
      }, 'b')   
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
