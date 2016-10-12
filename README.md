# <a href='https://github.com/jamesknelson/junctions/blob/master/README.md'><img src='https://raw.githubusercontent.com/jamesknelson/junctions/master/media/logo-title-dark.png' alt="Junctions" width='232'></a>

Composable and context-free routing for React, built on the excellent [history](https://github.com/mjackson/history) package.

Why use Junctions?

- They're **composable**. Re-use components, even if they contain links!
- They're **superimposable**. Because sometimes two routes can be active at once.
- They're **context-free**. Now you can understand how your own app works!
- They're **simple**. Don't believe me? Click the link on the next line.

## Demo

See [live demo](http://jamesknelson.com/react-junctions-example/), with source available in [examples/raw-react](https://github.com/jamesknelson/junctions/tree/master/examples/raw-react).

## Installation

At minimum, you'll need the junctions package

```
npm install junctions --save
```

If you want a `<Link>` component to get `pushState` working with React, install `react-junctions`

```
npm install react-junctions --save
```

Or if you want to use junctions-based components within a react-router application, install `react-router-junctions`

```
npm install react-router-junctions --save
```

Alternatively, use plain-ol' script tags with unpackage. See the live demo source for an example.

```
<script src="https://unpkg.com/junctions@0.0.5/dist/junctions.js"></script>
<script src="https://unpkg.com/react-junctions@0.0.5/dist/index.js"></script>
```

