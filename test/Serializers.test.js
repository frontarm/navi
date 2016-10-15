const assert = require('assert')

const { Serializer, isSerializer } = require('../lib')
const { deserializeParams, serializeParams } = require('../lib/SerializationUtils')


function serializeNumber(number) {
  return ""+number
}
function deserializeNumber(string) {
  return parseFloat(number)
}


describe("isSerializer", function() {
  it("returns false when passed an empty object", function() {
    assert(!isSerializer({}))
  })
})


describe("Serializer", function() {
  it("returns a Serializer", function() {
    const serializer = Serializer({
      serialize: serializeNumber,
      deserialize: deserializeNumber,
    })

    assert(isSerializer(serializer))
  })

  it("fails when `serialize` is missing", function() {
    assert.throws(() => {
      Serializer({
        deserialize: deserializeNumber,
      })
    })
  })

  it("fails when `deserialize` is missing", function() {
    assert.throws(() => {
      Serializer({
        serialize: serializeNumber,
      })
    })
  })
})
