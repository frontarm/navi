const assert = require('assert')

const { ParamType } = require('../lib/Declarations')
const { deserializeParams, serializeParams } = require('../lib/utils/SerializationUtils')
const Serializers = require('./fixtures/Serializers')
const paramTypes = require('./fixtures/ParamTypes')


describe("Param", function() {
  it("returns a Param", function() {
    const param = ParamType({
      required: true,
      default: 1,
      serializer: Serializers.number,
    })

    assert.equal(param.required, true)
    assert.equal(param.default, 1)
    assert(param.serializer)
  })

  it("fails when `serializer` is not a serializer", function() {
    assert.throws(() => {
      const param = ParamType({
        serializer: null,
      })
    })
  })
})


describe("deserializeParams", function() {
  it("deserializes passed in paramTypes", function() {
    assert.strictEqual(deserializeParams({ page: paramTypes.page }, { page: "1" }).page, 1)
  })
})


describe("serializeParams", function() {
  it("serializes passed in paramTypes", function() {
    assert.strictEqual(serializeParams({ page: paramTypes.page }, { page: 1 }).page, "1")
  })
})
