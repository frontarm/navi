---
title: createJunction
---

# `createJunction(branches)`

Creates a [Junction](Junction.md) object to specify the possible types of [Route](Route.md) which a component can handle. For more details on Junctions, see the [What You Get From Junctions](/docs/introduction/what-you-get-from-junctions.md) or [Junctions](/docs/basics/junctions.md) articles in the Guide.

#### Arguments

Accepts an object of *branches*, which define the types of `Route` which a component can render. The object keys are used to uniquely identify each route type. 

```js
{
  [key]: Branch,
}
```

##### Branch

Each `Branch` object contains configuration for one type of `Route`. It can include any of the following properties:

*   `data` (*object*)

    Stores application-specific data, such as a Component used to render routes of this type.

*   `default` (*boolean*)

    If true, the Junction will default to this branch if no route is known. If a Junction does not specify a default, its state will default to `null`.

*   `next` (*[Junction](Junction.md) | { [key]: [Junction](Junction.md) }*)

    Specifies the subsequent types of routes which a route of this type can take. Like [createConverter](createConverter.md), specifying an object of Junctions will allow for one `Route` from each `Junction` to be active simultaneously.

*   `paramTypes` (*{ [key]: Param }*)

    Configures the parameters for routes of this type.

*   `path` (*string*)

    Specifies how routes of this type should be represented in URLs. If not specified, a default will be generated based on the branch's key and required param types.

##### Param

Each parameter requires a configuration object. It can be blank, or it can have any combination of the following properties:

* `required` (*boolean*)

  If true, routes of this type cannot be created without this parameter.

* `default` (*value | function*)

  If specified, routes which are not supplied with this parameter will be given a default value. If not specified, the parameter will default to `undefined`.

* `serializer` (*{ serialize, deserialize }*)

  Define how this parameter's values should be converted to and from strings such as URL components.

#### Example

```js
const appJunction = createJunction({
  Home: {
    default: true,
    path: '/dashboard',
    data: {
      Component: DashboardScreen,
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
