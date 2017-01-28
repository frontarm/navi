# Junctions: Routing You Can Follow.

Junctions is a router built from the ground up for React.

It lets you create *plain-old components with routes and links* that integrate seamlessly with the browser's forward and back buttons.

## Why use Junctions?

- **Reusability.** Components you create with Junctions are reusable *anywhere*.
- **User Experience.** The Back and Forward buttons work just as the user expects.
- **Integration.** Junctions gets out of the way and lets React be React.

## Getting Started

The pitch for a super awesome routing library is a funny place to get asked "Do you actually need a router?" -- but it would be irresponsible to tell you how great Junctions is without telling you that *not using any router is often even better*. So ask yourself -- [do you really *need* a Router?](/docs/introduction/do-i-need-a-router.md)

Once you've decided that Junctions fits your needs, its time to get started! And you're in luck, because Junctions is super simple. Everything you need is available from just 4 functions and 4 methods. In fact, Junctions is *so* simple that after following clicking this [Tutorial](/docs) link and following the instructions, you'll have the basics down pat. But then what should you do?

## Demos

This website hosts a number of live demos with source. Take a look at the [Raw](/examples/Raw.example.js) example to see how Junctions works without any React-specific helper components, or see [Basic](/examples/Basic.example.js) for a typical example.

Also, the [Junctions Website](https://junctions.js.org) actually uses Junctions underneath the hood. If you're viewing the website right now, open your developer console to take a look!

## Installation

At minimum, you'll need the junctions package

```bash
npm install junctions --save
```

If you want [&lt;Link&gt;](/docs/api/react-junctions/Link.md) and [&lt;Router&gt;](/docs/api/react-junctions/Router.md) components to help integrating with React, install `react-junctions`

```bash
npm install react-junctions --save
```

Alternatively, use plain-ol' script tags with unpkg.

```html
<script src="https://unpkg.com/junctions@0.3.0/dist/junctions.js"></script>
<script src="https://unpkg.com/react-junctions@0.3.2/dist/index.js"></script>
```

## Contributing

Contributions are welcome, especially for the documentation.

To get the documentation running locally, you'll need to make sure you have a link to the junctions package itself in your `node_modules` directory:

```bash
npm install
npm link
npm link junctions
npm run docs:start
```

Then open your browser to <http://localhost:4000>!
