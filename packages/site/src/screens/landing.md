Junctions
=========

**A batteries-included router for React.**

*[&raquo; But react-router already exists, so why another router?](/why-another-router)*

Junctions gives you a great user experience right out of the box, with:

- Scroll management that just works
- Page `<title>` management (with a title announcer for accessibility)
- A static site generator that works with create-react-app
- Code splitting via ESNext's `import()` proposal
- Console warnings when a `<Link>` points to a 404
- Great TypeScript support

And the best part? Junctions is *fast*. It combines code splitting and static site generation to give users *immediate* access to content, then seamlessly adds features as your app loads.

*And all without ejecting from create-react-app.*


Documentation
-------------

- [The Tutorial](/tutorial) walks you through building a small documentation website with create-react-app.
- [Static builds with create-react-app](/static-sites-with-create-react-app) covers adding static rendering to a create-react-app project.
- [API Reference](/api-reference)


Installation
------------

```bash
# For defining your route structure, and adding routes to a React app
npm install --dev junctions react-junctions

# For static site generation
npm install --save-dev junctions-static
```


License
-------

Junctions is MIT licensed.
