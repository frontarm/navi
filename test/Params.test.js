const assert = require('assert')

const { Param, isParam } = require('../lib')
const { deserializeParams, serializeParams } = require('../lib/SerializationUtils')
const Serializers = require('./fixtures/Serializers')
const Params = require('./fixtures/Params')


describe("isParam", function() {
  it("returns false when passed an empty object", function() {
    assert(!isParam({}))
  })
})


describe("Param", function() {
  it("returns a Param", function() {
    const param = Param({
      required: true,
      default: 1,
      serializer: Serializers.number,
    })

    assert(isParam(param))
  })

  it("fails when `serializer` is not a serializer", function() {
    assert.throws(() => {
      const param = Param({
        serializer: null,
      })
    })
  })
})


describe("deserializeParams", function() {
  it("deserializes passed in params", function() {
    assert.strictEqual(deserializeParams({ page: Params.page }, { page: "1" }).page, 1)
  })
})


describe("serializeParams", function() {
  it("serializes passed in params", function() {
    assert.strictEqual(serializeParams({ page: Params.page }, { page: 1 }).page, "1")
  })
})
