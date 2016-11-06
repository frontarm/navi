const assert = require('assert')

const { JunctionSet, Junction, Branch, isBranchTemplate } = require('../lib')
const paramTypes = require('./fixtures/ParamTypes')
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
      paramTypes: { _invoiceId: paramTypes.id },
      children: JunctionSets.invoiceListScreen,
    })

    assert(isBranchTemplate(branchTemplate))
  })

  it("fails when given a non-pattern param key which is already taken by a child branch", function() {
    const childJunctions = JunctionSet({
      x: Junction({
        y: Branch({
          paramTypes: { page: true },
        })
      })
    }, 'x')

    assert.throws(() => {
      Junction({
        a: Branch({
          paramTypes: { page: true },
          children: childJunctions
        })
      })
    })
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
