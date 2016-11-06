const assert = require('assert')

const { Param } = require('../lib/Declarations')
const { deserializeParams, serializeParams } = require('../lib/utils/SerializationUtils')
const Serializers = require('./fixtures/Serializers')
const Params = require('./fixtures/Params')


describe("Param", function() {
  it("returns a Param", function() {
    const param = Param({
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
