const assert = require('assert')
const desugarChildren = require('../lib/desugarChildren').default
const JunctionSet = require('../lib/JunctionSet').default
const { createJunction } = require('../lib')


describe('desugarChildren', function() {
  beforeEach(function() {
    this.a = createJunction({ x: true })
    this.b = createJunction({ y: true })
    this.junctionSet = JunctionSet({ a: this.a, b: this.b })
  })

  it('returns non-arrays as-is', function() {
    const input = { a: this.a.createRoute('x'), b: this.b.createRoute('y') }
    const output = desugarChildren(this.junctionSet, [input])
    assert.equal(input, output)
  })
  it('correctly handles null values', function() {
    const routes = [null, this.a.createRoute('x')]
    const routeSet = desugarChildren(this.junctionSet, routes)
    assert.deepEqual(routeSet, { a: routes[1] })
  })
  it('finds branches in the passed in JunctionSet', function() {
    const routes = [this.a.createRoute('x'), this.b.createRoute('y')]
    const routeSet = desugarChildren(this.junctionSet, routes)
    assert.deepEqual({ a: routes[0], b: routes[1] }, routeSet)
  })
  it('fails if a route with an unknown branch is passed in', function() {
    assert.throws(function() {
      desugarChildren(this.junctionSet, [createJunction({ z: true }).createRoute('z')])
    })
  })
  it('fails if multiple routes for the same branch are passed in', function() {
    assert.throws(function() {
      desugarChildren(this.junctionSet, [this.a.createRoute('x'), this.a.createRoute('x')])
    })
  })
})
