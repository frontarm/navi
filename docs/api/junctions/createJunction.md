---
title: createJunction
---

# `createJunction(branches)`

Create a [Junction](Junction), configuring it with the route types which can represent the state of the Junction at any given time. Within Junctions, these route types are often called **Branches**.

#### Arguments

Accepts a single configuration object. Each key defines the *name* of a route type, and each value contains a `branch` object which holds configuration for the route type.

```js
{[name]: Branch}
```

##### Branch

The `branch` object can contain any of the following properties:

* `children` (*[Junction](Junction) | {[key]: Junction}*): A Junction or group of Junctions representing the possible states of child components.
* `data` (*object*): Stores application-specific data, such as a Component used to render routes of this type.
* `default` (*boolean*): If true, the Junction will default to this branch if no route is known. If a Junction does not specify a default, its state will default to `null`.
* `paramTypes` (*{[key]: param}*): Configures the parameters for routes of this type.
* `path` (*string*): Specifies how routes of this type should be represented in URLs. If not specified, a default will be generated based on the branch's key and required params.

##### Param

Each parameter requires a configuration object. It can be blank, or it can have any combination of the following properties:

* `required` (*boolean*): If true, routes of this type cannot be created without this parameter.
* `default` (*value | function*): If specified, routes which are not supplied with this parameter will be given a default value. If not specified, the parameter will default to `undefined`.
* `serializer` (*{ serialize, deserialize }*): Define how this parameter's values should be converted to and from strings such as URL components.

#### Example:

```js
const appJunction = createJunction({
  Home: {
    default: true,
    path: '/dashboard',
    data: {
      Cmoponent: DashboardScreen,
    },
  },

  Contacts: {
    paramTypes: {
      page: {
        default: 1,
        serializer: {
          serialize: (x) => x ? String(x) : '',
          deserialize: (x) => x === '' ? null : window.parseInt(x),
        }
      },
    },
    children: ContactsScreen.junctions,
    data: {
      Component: ContactsScreen,
    },
  }
})
```
