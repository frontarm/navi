# react-navi-helmet

Integration between Navi and [react-helmet](http://npmjs.com/package/react-helmet).

Automatically renders your routes' `title` and `head` properties with a `<Helmet>`, and also handles statically rendering the Helmet if you're using navi-scripts.

Also see [react-navi-helmet-async](http://npmjs.com/package/react-helmet) if you're doing SSR.

## Basic Usage

Just import `<HelmetProvider>` and wrap your app with it:

```js
import HelmetProvider from 'react-navi-helmet'

// ...

<HelmetProvider>
  <Router
    // ...
  />
</HelmetProvider>
```

## Documentation

See the [Navi Website](https://frontarm.com/navi/integrations/react-helmet/).