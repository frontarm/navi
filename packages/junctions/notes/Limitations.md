Loaders
-------

A loader receives the `Locators` object of the junction in which it is used.

However, loaders do *not* receive `location` object of the junction state. This is because the `location` object can vary, while the locator functions on `Locators` will always return the same output for the same input (as they can only be define in a context where no URL parameters are used.)

While it would certainly be possible to create a system where loaders receive the current location, such a system would have other limitations. For example, you couldn't define React components within a loader, as any change to URL parameters would require the loader to be re-computed, thus creating a *new* React component and causing the old components to be unmounted.

