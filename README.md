# Composable Routing For React

Junctions.js is a router built from the ground up for component-based applications.

It equips you to create reusable React components that have routes and links, and integrate seamlessly with the browser [History API](https://developer.mozilla.org/en/docs/Web/API/History).

## Why use junctions.js?

Because it has *principles*.

- **Composability.** Reuse components anywhere. Even those with links and routes!
- **No Surprises.** The Back and Forward buttons work just as the user expects.
- **Flexibility.** Junctions doesn't make decisions for you. It let's React be React.

These three principles are described in more (and less) detail in [The Haiku Of Routing Principles](/docs/introduction/three-principles.md).

## Getting Started

The pitch for a super awesome routing library is a funny place to get asked "Do you actually need a router?" -- but it would be irresponsible to tell you how great junctions.js is without telling you that *not using any router is often even better*. So ask yourself -- [do you really *need* a router?](/docs/introduction/do-i-need-a-router.md)

Once you've decided that junctions.js does fit your needs, the best way to get started is to try it. and the [Tutorial](/docs) makes this easy -- after following along, you'll have built a real app and have the experience to apply junctions.js to your own projects.

## Demos

This website hosts a number of live demos with source. Take a look at the [Raw](/examples/Raw.example.js) example to see how Junctions works without any React-specific helper components, or see [Basic](/examples/Basic.example.js) for a typical example.

Also, the [junctions.js website](https://junctions.js.org) eats its own dog food. When viewing the website, you can open your developer console to take a look!

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
