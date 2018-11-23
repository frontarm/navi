# Navigation objects

Each Navi app has a `Navigation` object that holds its history, routingo state, etc.

You can either create a `Navigation` object with `createBrowserNavigation()` in the browser, or `createMemoryNavigation()` on the server.

Whichever way you create a Navigation object, they both implement the same `Navigation` interface.

## `Navigation` interface

### `navigation.history`

A history object -- see the [history](https://npmjs.com/package/history) package for details.

### `navigation.router`

A Router object.

### `navigation.steady()`

Returns a promise that resolves once the current value will no longer change without the history itself changing; i.e. once it reaches a steady state.

### `navigation.getSteadyValue()`

Returns a promise to a steady state `NavigationSnapshot` object.

### `navigation.getCurrentValue()`

Returns the current `NavigationSnapshot` object.

### `navigation.subscribe()`

## `createBrowserNavigation()`

#### Example

```js
let navigation = Navi.createBrowserNavigation({
  // Your app's root switch
  pages,
})
```

## `createMemoryNavigation()`

#### Example

```js
let navigation = Navi.createMemoryNavigation({
  // Your app's root switch
  pages: Navi.createSwitch({
    // ...
  }),

  // The URL to resolve
  url: '/test',
})
```