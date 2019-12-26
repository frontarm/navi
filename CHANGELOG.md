Changelog
=========


0.14.0
------

### New features

- The `<Router hashScrollBehavior>` prop and the `<HashScroll>` component now accept a value of "none" to completely scrolling completely, or a function that can be used to implement custom scrolling behaviors. This will allow you to [use Navi with react-native apps](https://github.com/frontarm/navi/issues/154).

```js
<Router hashScrollBehavior="none">
  ...
</Router>
```

- The `<Link>` component now accepts a `state` prop, allowing you to pass state to your routes from the view.

- The `<Link prefetch>` prop now supports a value of `hover`, which is the new default. When prefetch is set to `hover`, the link's content will be prefetched whenever the user's mouse hovers over the link, using an `onMouseEnter` handler. This can be disabled by passing a `prefetch={false}` prop.


### Removed features

- Removed warning when patterns contain characters that aren't URL safe. For reason, [see here](https://github.com/frontarm/navi/issues/149).

- Remove deprecated `navigation` methods:
  * `getSteadyValue()` - use `getRoute()` instead
  * `steady()` - use `getRoute()` instead

- Remove deprecated route properties:
  * `meta`
  * `content`
  * `segments`
  * `lastSegment`

- Remove support for `render` props in favor of hooks:
  * Instead of `<Link render>`, use `useLinkProps()`
  * Instead of `<View children>`, use `useView()`
  * Instead of `<CurrentRoute>`, use `useCurrentRoute()`
  * Instead of `<LoadingRoute>`, use `useLoadingRoute()`
  * Instead of `<NaviConsumer>`, use `useNavigation()`

If you still need any of these render props, you can create your own custom
component that accepts a render prop and uses the hook internally.


0.13.6
------

- Bind `navigate` method of Navigation class, so that it can be destructured from return of `useNavigation()`


0.13.5
------

- Fix bug where the new `loading` option for `useActive` caused `exact` to be false by default.


0.13.4
------

- Add a `loading` option to `useActive`, so that you can easily find whether a given link has been clicked -- even if it is still loading. This makes links to pages with async dependencies feel more responsive.

```
// Will return `true` even while loading the URL
let active = useActive('/url-with-async-dependencies', {
  loading: true
})
```


0.13.3
------

- Fix `peerDependencies`


0.13.2
------

- Include react-helmet types, so that react-navi-helmet works out of the box with TypeScript


0.13.1
------

- Fix a regression where nested `<View />` components with async routes inside of a `<Suspense />` were failing to render.


0.13.0
------

### Hooks!

This release exposes four new hooks for your convenience:

- `useViewElement()` returns the element that would have been rendered by `<View />`. This makes animated transitions far simpler, as you can keep the element in state and it'll always render the same view as when it was first created.

- `useView()` is like `useViewElement()`, but returns an object with the raw view and head content, and a `connect()` function that you'll need to wrap them with. You can think of it like the render-prop version of `<View>`

- `useLinkProps(props)` accepts the same props as a `<Link>`, and returns an object with `href`, `onClick`, and any other props that you'd want to spread onto an `<a>`.

- `useActive(href)` returns `true` when the current route matches the specified href. You can use this along with `useLinkProps` to create your own custom styled links.

In fact, the Navi `<View>` and `<Link>` components now use these hooks internally. You can think of these components as a shortcut for using the above hooks.


### Breaking Changes

-   React 16.8+ is now required, as hooks are now used internally.

-   Instead of automatically integrating with react-helmet, you'll need to wrap your app with a Helmet provider. This change was necessary to allow people to use react-helmet-async, which is required for SSR.

    If you want to handle the page `<head>` without Navi, no changes are required. 

    If you want to continue to use Navi's `head` and `title` options, there's just two steps to upgrade:
    
    1. Add the `react-navi-helmet` or `react-navi-helmet-async` package
    2. Import the default `<HelmetProvider>`, and wrap your app with it:

    ```jsx
    import HelmetProvider from 'react-navi-helmet-async'

    ReactDOM.render(
      <HelmetProvider>
        <Router routes={routes}>
          ...
        </Router>
      </HelmetProvider>,
      document.getElementById('root')
    )
    ```

-   Previously deprecated properties and exports have been removed


0.12.10
-------

 -   Fix bug where matching was overly aggressive

     https://github.com/frontarm/navi/issues/109


0.12.9
------

### react-navi

-   [Update typings so that they do not require `esModuleInterop` to be true.](https://github.com/frontarm/navi/issues/99)


0.12.8
------

### react-navi

-   No longer use smooth scroll by default, as it causes errors in some browsers.
    
    To enable smooth scroll, pass `hashScrollBehavior='smooth'` to your `<Router>` or `<NaviProvider>` component.

    See https://github.com/frontarm/navi/issues/71

-   Fix #90 (all links have a `context="[object Object]"` attribute)

### navi-scripts

-   Upgrade create-react-navi-app template to use react-scripts-mdx, with @mdx-js/mdx 1.


0.12.7
------

### navi

-   Fix issue where route state was overriding `route.data`, instead of being placed in `route.state`
