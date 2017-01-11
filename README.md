# Junctions: Routing You Can Follow.

Built for React, using the excellent [history](https://github.com/mjackson/history) package.

Why use Junctions?

- **It's reusable.** No hard-coded URLs means *truly* reusable components.
- **It's simple.** Everything you need in only 4 functions and 4 methods.
- **It's independent.** Works great with React, but doesn't rely on it.

## Demo

The best way to understand Junctions is to see it in action. With that in mind, the [Junctions Website](https://junctions.js.org) uses Junctions underneath the hood -- and logs relevant details to the console as you navigate. If you're viewing the website right now, open your developer console to take a look.

There are also a number of live demos with source. Take a look at the [Raw](https://junctions.js.org/examples/Raw) example to see how Junctions works without any React-specific helper components, or see [Basic](https://junctions.js.org/examples/Basic) for a typical example.

## Installation

At minimum, you'll need the junctions package

```bash
npm install junctions --save
```

If you want [&lt;Link&gt;](https://junctions.js.org/docs/api/react-junctions/Link) and [&lt;Router&gt;](https://junctions.js.org/docs/api/react-junctions/Router) components to help integrating with React, install `react-junctions`

```bash
npm install react-junctions --save
```

Alternatively, use plain-ol' script tags with unpkg.

```html
<script src="https://unpkg.com/junctions@0.3.0/dist/junctions.js"></script>
<script src="https://unpkg.com/react-junctions@0.3.2/dist/index.js"></script>
```

## Getting Started

But before starting, ask yourself -- do you really *need* a Router? The [Introduction](https://junctions.js.org/docs/introduction/do-i-need-a-router) covers this, before introducing the three main concepts you'll use with Junctions.

The next step is practice. The [Basics](https://junctions.js.org/docs/basics/Locations) section of the Guide will walk you through using the most important tools which Junctions provides, finishing with a full Example.

## Contributing

Contributions are welcome, especially for the documentation.

To get the documentation running locally, you'll need to run `npm install` in **both** the root directories and the site directory. This is because babel looks at the root `.babelrc` when compiling the example files.

Once you've installed the dependencies, run `npm start` from the `site` directory, then open the browser at <http://localhost:8080>

```bash
npm install
cd site
npm install
npm start
```
