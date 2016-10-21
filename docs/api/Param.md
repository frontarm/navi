# `Param({ required, default, serializer })`

Represents one parameter which routes through a Branch can take

#### Options

* `required` (*boolean*): ...
* `default` (*value | function*): ...
* `serializer` (*[Serializer](Serializer.md)*): ...

#### Returns

(*Param*) 

#### Example:

```js
Param({
  default: () => 1,
  required: true,
  serializer: Serializer({ serialize: x => moment(x), deserialize: x => x === '' ? null : parseInt(x) })
})
```
