const assert = require('assert')

const { Junction, Branch, Param, isJunction } = require('../lib/junctions')
const { formatPattern } = require('../lib/PatternUtils')
const BranchTemplates = require('./fixtures/BranchTemplates')


describe("isJunction", function() {
  it("returns false when passed an empty object", function() {
    assert(!isJunction({}))
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


  it("creates a default pattern based on branch params", function() {
    const junction = Junction({
      testBranch: Branch({
        params: {
          required: Param({ required: true }),
          requiredAndHidden: Param({ required: true, hidden: true }),
          defaulted: Param({ default: "1" }),
          optional: Param({}),
        },
      }),
    })

    const formattedPath = formatPattern(junction.branches.testBranch.pattern, {
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
