Changelog
=========

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
