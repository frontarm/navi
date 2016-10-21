# `Serializer({ serialize, deserialize })`

Defines a way to serialize and deserialize parameters. This allows your parameters to be any type of object, while still appearing as user friendly strings in URLs.

#### Options

* `serialize` (*function*): A function taking a value and returning the serialized string
* `deserialize` (*function*): A function taking a serialized string and returning the value

#### Returns

(*Serializer*) 

#### Example:

```js
Serializer({
  serialize: x => String(x),
  deserialize: x => x === '' ? null : parseInt(x)
})
```
