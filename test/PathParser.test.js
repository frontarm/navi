const assert = require('assert')
const deepEqual = require('deep-equal')
const { minimal, junctionSetWithPrimary } = require('./fixtures/JunctionSets')

const { JunctionSet, Junction, Branch } = require('../lib/junctions')
const { createPathParser } = require('../lib/PathParser')



describe('createPathParser', function() {
  it("returns a function given a minimal JunctionSet", function() {
    const junctionSet =
      JunctionSet({
        ja: Junction({
          ba: Branch()
        })
      })

    const pathParser = createPathParser(junctionSet)

    assert(typeof pathParser == 'function', "createPathParser returns a function")
  })
})


describe('parsePath', function() {
  it("converts a path to a map of tree nodes", function() {
    const junctionSet =
      JunctionSet({
        ja: Junction({
          ba: Branch(),
          bb: Branch(),
        }),
        jb: Junction({
          ba: Branch(),
        })
      }, 'ja')

    const parsePath = createPathParser(junctionSetWithPrimary)
    const map = parsePath('/ba')

    const expectedMap = {
      ba: { branchKey: 'ba', serializedParams: {}, routePath: 'ba' }
    }

    assert(deepEqual(map, expectedMap), "works correctly")
  })
})
