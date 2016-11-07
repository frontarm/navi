const assert = require('assert')

const { Junction, Branch } = require('../lib/Declarations')
const paramTypes = require('./fixtures/ParamTypes')
const JunctionSets = require('./fixtures/JunctionSets')


describe("Branch", function() {
  it("returns a Branch when options are given", function() {
    const branch = Branch({
      path: '/invoices/:_invoiceId',
      data: { test: 1 },
      paramTypes: { _invoiceId: paramTypes.id },
      children: JunctionSets.invoiceListScreen,
    })

    assert(branch)
  })

  it("fails when given a param key with the non alphanumeric/underscore value 'a1-'", function() {
    assert.throws(() => {
      Branch({ paramTypes: { 'a1-': paramTypes.id } })
    })
  })

  it("fails when children are given but are not a JunctionSet", function() {
    assert.throws(() => {
      Branch({ children: null })
    })
  })

  it("fails when an invalid path is given", function() {
    assert.throws(() => {
      Branch({ path: 'in:va:lid?/' })
    })
  })

  it("fails when `data` is not an object", function() {
    assert.throws(() => {
      Branch({ data: "test" })
    })
  })

  it("fails when a param is passed which is not a Param", function() {
    assert.throws(() => {
      Branch({ paramTypes: { test: null } })
    })
  })
})
