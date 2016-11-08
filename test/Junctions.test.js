const assert = require('assert')

const { createJunction, isJunction, isBranch } = require('../lib')
const { Route, LocatedRoute } = require('../lib/Routes')
const { formatPattern } = require('../lib/utils/PatternUtils')
const Branches = require('./fixtures/Branches')
const JunctionSets = require('./fixtures/JunctionSets')


describe("isJunction", function() {
  it("returns false when passed an empty object", function() {
    assert(!isJunction({}))
  })
})

describe("isBranch", function() {
  it("returns false when passed a branch definition object", function() {
    assert(!isBranch(Branches.details))
  })
})


describe("Junction", function() {
  it("returns a Junction when given no default", function() {
    const junction = createJunction({
      abc123_: Branches.details,
    })

    assert(isJunction(junction))
  })

  it("returns a Junction when given a default", function() {
    const junction = createJunction({
      details: Branches.details,
      attachment: Branches.attachment,
    })

    assert(isJunction(junction))
  })


  it("returns Branch functions instead of BranchTemplate objects", function() {
    const junction = createJunction({
      details: Branches.details,
      attachment: Branches.attachment,
    })

    assert(isBranch(junction.details))
  })


  it("creates a default pattern based on branch paramTypes", function() {
    const junction = createJunction({
      testBranch: {
        paramTypes: {
          required: { required: true },
          defaulted: { default: "1" },
          optional: {},
        },
      },
    })

    const formattedPath = formatPattern(junction.testBranch.pattern, {
      required: 'a',
      defaulted: 'b',
    })

    assert.equal(formattedPath, 'test-branch/a/b')
  })


  it("fails when given no branches", function() {
    assert.throws(() => {
      createJunction({})
    })
  })

  it("fails when given multiple defaults", function() {
    assert.throws(() => {
      createJunction({
        details: { default: true },
        attachment: { default: true },
      })
    })
  })

  it("fails when the key contains the non-alphanumeric/underscore character '/'", function() {
    assert.throws(() => {
      createJunction({
        'joe/': BranchTemplates.details,
      })
    })
  })

  it("fails when given a non-pattern param key which is already taken by a child branch", function() {
    const childJunctions = {
      main: createJunction({
        y: {
          paramTypes: { page: true },
        }
      })
    }

    assert.throws(() => {
      createJunction({
        a: {
          paramTypes: { page: true },
          children: childJunctions
        }
      })
    })
  })
})


describe("Junction#branches.branchName", function() {
  it("returns a Route with correct branch, paramTypes and children", function() {
    // Note: JunctionSets.invoiceScreen is actually a getter, so run it this way to
    //       avoid creating multiple copies of it
    const childJunctionSet = JunctionSets.invoiceScreen

    const junction = createJunction({
      invoices: {
        paramTypes: {
          page: { default: 1 },
        },
        children: childJunctionSet,
      },
    })

    const route = junction.createRoute(
      'invoices',
      { page: 2 },
      childJunctionSet.main.createRoute('details')
    )

    assert.equal(route.constructor, Route)
    assert.equal(route.branch, junction.invoices)
    assert.equal(route.params.page, 2)
    assert.equal(route.children.main.branch, childJunctionSet.main.details)
  })
})
