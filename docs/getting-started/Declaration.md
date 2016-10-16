# Declaring a Junction Tree

To create a junction tree, you use the five *declaration functions*:

- `Branch`
- `Junction`
- `JunctionSet`
- `Param`
- `Serializer`

Let's have a look at how they're used in practice. For more details, you can see the API documentation.

## `Junction` and `Branch`

The `Junction` and `Branch` functions are used together to declare a single Junction. For example:

```js
const AppJunction = Junction({
  Dashboard: Branch({
    default: true,
    data: {
      Component: DashboardScreen,
    },
  }),
  Contacts: Branch({
    path: '/contacts',
    data: {
      Component: ContactsScreen,
    },
    children: ContactsScreen.junctionSet,
  }),
})
```

`Junction` takes a single object mapping keys to branches. The keys are used internally, but they're also used to generate default paths. In this example, the dashboard branch will use the default path, while the contacts branch will use the given one.

`Branch` specifies a single type of Route which can be extract from the part of the `Location` which our junction corresponds to. It can contains the following options:

-   `path`: *string*

    A URL template which corresponds to routes of this type

-   `params`: *object*

    The available parameters which the route can have, s

-   `data`: *object*

    Arbitrary data which you'd like to be available on associated `Route` objects

-   `children`: *JunctionSet*

    Child junctions which correspond to subsections of the same `Location`

-   `default`: *boolean*

    Allows you to specify one branch which will be considered active if the `Location` doesn't hold any information about this junction.

If you want to access the individual `Branch` objects, you can do so through the object which the `Junction` function returns.

```js
isBranch(AppJunction.Dashboard) === true
```

## `JunctionSet`

`JunctionSet` objects are used to specify a branch's children, and also at the root of your app. To get a `JunctionSet`, just pass an object mapping arbitrary keys to `Junction` objects:

```js
const app = JunctionSet({
  main: ContactsMain,
  modal: ContactsModal,
})
```

Only one junction in a set can have its state stored in the URL. The other junctions must have their state stored in [HTML5 History](https://developer.mozilla.org/en/docs/Web/API/History)'s state. To distingiush between the URL junctions and the others, this package uses a convention: the `main` junction will have its state stored in the URL if possible, while the other junctions will use HTML5 History.

## `Param`

Each branch must declare any parameters using the `Param` function. For example:

```js
Branch({
  path: '/list/:start',
  params: {
    start: Param({
      required: true,
    }),
  }
})
```

The keys of the `params` object can be added to a branch's `path`. This specifies that the param's value must be extracted from the URL path. However, if the key is not found in the `path` property, the value will be extracted from the URL query part with the relevant key.

The `Param` function understands three options:

-   `required`: *Boolean*
    
    Specifies whether a `Location` object this param do *not* match this branch

-   `default`: *Boolean*

    Specify a default value for non-required query params which do not have a known value. Can either be a value, or a function which returns a value

    Example:

    ```js
    Param({ default: () => new Date() })
    ```

-   `serializer`: *Serializer*

    Specify how to convert param values between the values used in a `Route`, and the string used in a `Location`. If no serializer is given, values will be raw strings, or `null` in the case of the empty string.

## `Serializer`

An object with `serialize` and `deserialize` methods, to be used with the `serializer` option of `Param`. For example:

```js
{
  page: Param({
    default: 1,
    serializer: Serializer({
      serialize: x => String(x),
      deserialize: x => x === '' ? null : parseInt(x)
    })
  })
}
```

## Next Steps

So now you know what Locations and Routes are, as well as how to use Junctions to specify the relationship between the two. The major remaining question is: how do we actually map a `Location` to a `JunctionSet`, and vice versa? And the answer is -- with a `Converter`, of course!
