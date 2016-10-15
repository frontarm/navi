const assert = require('assert')

const { locationsEqual } = require('../lib')


describe('locationsEqual', function() {
  it('returns true for equivalent full locations', function() {
    const a = {
      pathname: '/some-other-path',
      state: {
        $$junctions: {
          'main': { branchKey: 'invoice', serializedParams: { id: 'test' } },
          'main/main': { branchKey: 'details', serializedParams: {} },
        }
      },
      search: '?test=a'
    }

    const b = {
      pathname: '/some-other-path',
      state: {
        $$junctions: {
          'main': { branchKey: 'invoice', serializedParams: { id: 'test' } },
          'main/main': { branchKey: 'details', serializedParams: {} },
        }
      },
      search: '?test=a'
    }

    assert(locationsEqual(a, b))
  })

  it('returns true for equivalent empty locations', function() {
    const a = {
      pathname: '/some-other-path',
    }

    const b = {
      pathname: '/some-other-path',
      state: {
        $$junctions: {}
      },
    }

    assert(locationsEqual(a, b))
  })

  it('returns false for differing paths', function() {
    const a = {
      pathname: '/path-2',
    }

    const b = {
      pathname: '/path-1',
    }

    assert(!locationsEqual(a, b))
  })

  it('returns false for differing searches', function() {
    const a = {
      pathname: '/path-1',
      search: '/?test=a',
    }

    const b = {
      pathname: '/path-1',
      search: '/?test=b',
    }

    assert(!locationsEqual(a, b))
  })

  it('returns false for differing junction state keys', function() {
    const a = {
      pathname: '/path-1',
      state: {
        $$junctions: {
          'main': { branchKey: 'invoice', serializedParams: { id: 'test' } },
          'main/main': { branchKey: 'details', serializedParams: {} },
        }
      },
    }

    const b = {
      pathname: '/path-1',
      state: {
        $$junctions: {
          'main': { branchKey: 'invoice', serializedParams: { id: 'test' } },
        }
      },
    }

    assert(!locationsEqual(a, b))
  })

  it('returns false for differing junction state values', function() {
    const a = {
      pathname: '/path-1',
      state: {
        $$junctions: {
          'main': { branchKey: 'invoice', serializedParams: { id: 'test' } },
        }
      },
    }

    const b = {
      pathname: '/path-1',
      state: {
        $$junctions: {
          'main': { branchKey: 'invoice', serializedParams: { id: 'test-2' } },
        }
      },
    }

    assert(!locationsEqual(a, b))
  })
})
