const assert = require('assert')

const { createParamType } = require('../lib/Params')
const { deserializeParams, serializeParams } = require('../lib/Params')
const Serializers = require('./fixtures/Serializers')
const paramTypes = require('./fixtures/ParamTypes')


describe("createParamType", function() {
  it("returns a ParamType", function() {
    const param = createParamType({
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
      const param = createParamType({
        serializer: null,
      })
    })
  })

  it("fails when `serialize` is missing", function() {
    assert.throws(() => {
      createParamType({
        serializer: {
          deserialize: function() {},
        }
      })
    })
  })

  it("fails when `deserialize` is missing", function() {
    assert.throws(() => {
      createParamType({
        serializer: {
          serialize: function() {},
        }
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
