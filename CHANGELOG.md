# Changelog

## 0.12.8

### react-navi

-   No longer use smooth scroll by default, as it causes errors in some browsers.
    
    To enable smooth scroll, pass `hashScrollBehavior='smooth'` to your `<Router>` or `<NaviProvider>` component.

## 0.12.7

### navi

-   Fix issue where route state was overriding `route.data`, instead of being placed in `route.state`
