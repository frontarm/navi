# `Branch({ path, params, data, children, default })`

Represents one possible type of Route which can be taken on a given Junction.

`path` will be automatically generated from the available params if not specified.

#### Arguments

* `children` (*[JunctionSet](JunctionSet.md)*): ...
* `data` (*object*): ...
* `default` (*boolean*): ...
* `params` (*{ [key]: [Param](Param.md) }*): ...
* `path` (*string*): ...

#### Returns

(*BranchTemplate*) 

#### Example:

```js
Branch({
  path: '/contacts',
  data: {
    Component: ContactsScreen,
  },
  children: ContactsScreen.junctionSet,
  params: {
    page: Param(),
    pageSize: Param(),
  },
})
```
