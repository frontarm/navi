const assert = require('assert')

const { Serializer } = require('../lib/Declarations')
const { deserializeParams, serializeParams } = require('../lib/utils/SerializationUtils')


function serializeNumber(number) {
  return ""+number
}
function deserializeNumber(string) {
  return parseFloat(number)
}


describe("Serializer", function() {
  it("returns a Serializer", function() {
    const serializer = Serializer({
      serialize: serializeNumber,
      deserialize: deserializeNumber,
    })

    assert.equal(serializer.serialize, serializeNumber)
    assert.equal(serializer.deserialize, deserializeNumber)
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
