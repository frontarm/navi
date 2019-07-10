# react-navi-helmet-async

Integration between Navi and [react-helmet-async](http://npmjs.com/package/react-helmet-async).

Automatically renders your routes' `title` and `head` properties with a `<Helmet>`, and also handles statically rendering the Helmet if you're using navi-scripts.

## Basic Usage

Just import `<HelmetProvider>` and wrap your app with it:

```js
import HelmetProvider from 'react-navi-helmet-async'

// ...

<HelmetProvider>
  <Router
    // ...
  />
</HelmetProvider>
```

## Documentation

See the [Navi Website](https://frontarm.com/navi/integrations/react-helmet/).