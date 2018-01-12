README
======

A batteries-included router for React.

*But react-router already exists, so [why another router?](#)*

Out of the box, you'll get a great experience for both users *and* developers, with:

- Scroll management
- Page `<title>` management (with a title announcer for accessibility)
- Console warnings when a `<Link>` points to a 404
- TypeScript support
- Code splitting via ESNext's `import()` proposal
- A tool to build static websites for create-react-app projects

And the best part? Junctions is *fast*. It combines code splitting and static site generation to give users *immediate* access to content, then seamlessly adds features as your app loads.

*And all without ejecting from create-react-app.*


Documentation
-------------

You can find documentation [on the website](#).

- [The Tutorial](#) walks you through building a small documentation website with create-react-app.
- [Building with create-react-app](#) covers adding static rendering to a create-react-app project.
- [API Reference](#)


Installation
------------

```js
# Everything you need is exported from `react-junctions`
npm install react-junctions

# The build tool is in `junctions-static`
npm install --dev junctions-static
```


License
-------

Junctions is MIT licensed.
