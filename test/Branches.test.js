const assert = require('assert')

const { Param, JunctionSet, Junction, Branch, isBranchTemplate } = require('../lib')
const Params = require('./fixtures/Params')
const JunctionSets = require('./fixtures/JunctionSets')


describe("isBranchTemplate", function() {
  it("returns false when passed an empty object", function() {
    assert(!isBranchTemplate({}))
  })
})


describe("Branch", function() {
  it("returns a BranchTemplate", function() {
    const branchTemplate = Branch()

    assert(isBranchTemplate(branchTemplate))
  })

  it("returns a BranchTemplate when options are given", function() {
    const branchTemplate = Branch({
      path: '/invoices/:_invoiceId',
      data: { test: 1 },
      params: { _invoiceId: Params.id },
      children: JunctionSets.invoiceListScreen,
    })

    assert(isBranchTemplate(branchTemplate))
  })

  it("fails when given a non-pattern param key which is already taken by a child branch", function() {
    const childJunctions = JunctionSet({
      x: Junction({
        y: Branch({
          params: { page: Param() },
        })
      })
    }, 'x')

    assert.throws(() => {
      Junction({
        a: Branch({
          params: { page: Param() },
          children: childJunctions
        })
      })
    })
  })

  it("fails when given a param key with the non alphanumeric/underscore value 'a1-'", function() {
    assert.throws(() => {
      Branch({ params: { 'a1-': Params.id } })
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
      Branch({ params: { test: null } })
    })
  })
})
