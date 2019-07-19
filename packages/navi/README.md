<p align="center">
  <a href='https://frontarm.com/navi/'>
    <img src='/media/logo.png' height='100' alt='Navi Logo' aria-label='frontarm.com/navi' />
  </a>
</p>

<h2 align="center">
  Navi
</h2>

<p align="center">
  Declarative, asynchronous routing for React.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/navi"><img alt="NPM" src="https://img.shields.io/npm/v/navi.svg"></a>
  <a href="https://travis-ci.org/frontarm/navi"><img alt="Build" src="https://travis-ci.org/frontarm/navi.svg?branch=master"></a>
</p>

**Navi is a JavaScript library for declaratively mapping URLs to asynchronous content.**

It comes with:

- A set of modern React components and hooks, with Suspense support
- A static HTML generation tool that works with create-react-app *without* ejecting
- Great TypeScript support

[View the docs &raquo;](https://frontarm.com/navi/)


Quick Start
-----------

At it's core, Navi is just a router. You can use it with any React app – just add the `navi` and `react-navi` packages to your project:

```bash
npm install --save navi react-navi
```

If you'd like a more full featured starter, you can get started with [Create React/Navi App](https://frontarm.com/navi/create-react-navi-app/):

```bash
npx create-react-navi-app my-app
cd my-app
npm start
```

Or if you want to create a blog, use [create-react-blog](https://github.com/frontarm/create-react-blog):

```bash
npx create-react-blog react-blog
cd react-blog
npm start
```


Getting Started
---------------

For a full introduction, see the [Getting Started](https://frontarm.com/navi/en/guides/getting-started/) guide on the Navi website.


Who's using Navi?
-----------------

- [Frontend Armory](http://frontarm.com)
- [Laska - a UI Builder for React Native](https://laska.io)
- [Otovo](https://www.otovo.com/) uses Navi for serving 80+ pages across three different markets ([.no](https://www.otovo.no), [.se](https://www.otovo.se) and [.fr](https://www.otovo.fr/))
- [Marek Calus' blog](https://mcalus.netlify.com/)
- [Offset Earth](https://offset.earth/)
- *Using Navi? Submit a Pull Request to add your site here!*


Contributing
------------

We are grateful to the community for contributing bugfixes, documentation, translations, and any other improvements.

This repository is monorepo that holds the source for Navi and it's related packages, while the Navi website -- which includes Navi's documentation, is part of the [navi-website](https://github.com/frontarm/navi-website) repository.

### Building and Testing Navi

To contribute code to Navi, you'll need to be able to build it and run the tests. To start, make sure you have [lerna](https://www.npmjs.com/package/lerna) 3.x installed globally:

```bash
npm install -g lerna
```

Then fork, clone and bootstrap the repository:

```bash
lerna bootstrap
yarn build
yarn test
```

If you're working on Navi itself, it's often easier to run builds and tests from `packages/navi`

```bash
cd packages/navi
yarn test:watch
```

The [examples](./examples) are set up to use the copy of Navi at `packages/navi/dist`, so they can also be useful for quickly testing changes.


License
-------

Navi is MIT licensed.
