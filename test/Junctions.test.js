const assert = require('assert')

const { Junction, Branch, Param, isJunction, isBranch } = require('../lib/junctions')
const { Route, LocatedRoute } = require('../lib/Routes')
const { formatPattern } = require('../lib/PatternUtils')
const BranchTemplates = require('./fixtures/BranchTemplates')
const JunctionSets = require('./fixtures/JunctionSets')


describe("isJunction", function() {
  it("returns false when passed an empty object", function() {
    assert(!isJunction({}))
  })
})

describe("isBranch", function() {
  it("returns false when passed a BranchTemplate", function() {
    assert(!isBranch(BranchTemplates.details))
  })
})


describe("Junction", function() {
  it("returns a Junction when given no default", function() {
    const junction = Junction({
      abc123_: BranchTemplates.details,
    })

    assert(isJunction(junction))
  })

  it("returns a Junction when given a default", function() {
    const junction = Junction({
      details: BranchTemplates.details,
      attachment: BranchTemplates.attachment,
    }, 'details')

    assert(isJunction(junction))
  })


  it("returns Branch functions instead of BranchTemplate objects", function() {
    const junction = Junction({
      details: BranchTemplates.details,
      attachment: BranchTemplates.attachment,
    }, 'details')

    assert(isBranch(junction.details))
  })


  it("creates a default pattern based on branch params", function() {
    const junction = Junction({
      testBranch: Branch({
        params: {
          required: Param({ required: true }),
          defaulted: Param({ default: "1" }),
          optional: Param({}),
        },
      }),
    })

    const formattedPath = formatPattern(junction.testBranch.pattern, {
      required: 'a',
      defaulted: 'b',
    })

    assert.equal(formattedPath, 'test-branch/a/b')
  })


  it("fails when given no branches", function() {
    assert.throws(() => {
      Junction({})
    })
  })

  it("fails when given an unknown key for default", function() {
    assert.throws(() => {
      Junction({
        details: BranchTemplates.details,
        attachment: BranchTemplates.attachment,
      }, 'something-else')   
    })
  })

  it("fails when the key contains the non-alphanumeric/underscore character '/'", function() {
    assert.throws(() => {
      Junction({
        'joe/': BranchTemplates.details,
      })
    })
  })
})


describe("Junction#branches.branchName", function() {
  it("returns a Route with correct branch, params and children", function() {
    // Note: JunctionSets.invoiceScreen is actually a getter, so run it this way to
    //       avoid creating multiple copies of it
    const childJunctionSet = JunctionSets.invoiceScreen

    const junction = Junction({
      invoices: Branch({
        params: {
          page: Param({ default: 1 }),
        },
        children: childJunctionSet,
      }),
    })

    const route = junction.invoices(
      { page: 2 },
      { content: childJunctionSet.content.details() }
    )

    assert.equal(route.constructor, Route)
    assert.equal(route.branch, junction.invoices)
    assert.equal(route.params.page, 2)
    assert.equal(route.children.content.branch, childJunctionSet.content.details)
  })
})
