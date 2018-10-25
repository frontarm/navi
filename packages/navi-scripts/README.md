# navi-tool

Build static websites with navi, with one HTML file for each URL.

## Install it

```bash
npm install navi-tool
```

## Example

To render your website, navi-tool needs two things:

- A file which exports a `renderToString({ junction, location, dependencies, meta }) => string` function (which can be async)
- Your site's public folder, which contains the built version of your app (without any HTML files)
- The filename within your public directory that contains the "main" file, which should set two globals:

  * `main()` - a function to start your app 
  * `rootJunction` - your app's root junction

Then, building your site is simply a matter of calling the command line utility, which will load the junction and walk through each of its nodes, rendering a file to the public directory as it goes.

```bash
node_modules/.bin/navi --public public --main public/main.js --render src/renderToString.js
```

Of course, repeatedly typing these command line options would soon become frustrating, so you can also specify the options in a "navi.config.js" file:

```js
export default {
  public: 'public',
  main: 'main.js',
  renderToString: 'src/renderToString.js',
}
```

## Integrating with create-react-app

Integrating navi-tool with create-react-app is simple. You don't even need to eject!

- wrap the bootstrap code in index.js in a `main` function, which is placed on the global `window` object
- export a root junction from index.js
- at the bottom of index.js, call `main` if we're running in the dev server:

```js
if (!process.env.REACT_APP_STATIC) {
  main()
}
```

While you'd usually also need to supply a `render` file, navi-tool includes one that works with create-react-app - to use it, just pass the `--render create-react-app` option to `navi`.

Then update the `build` script in `package.json`:

```
"build": "cross-env REACT_APP_STATIC=true && react-scripts build && navi build --output build --main build/static/js/main.*.js --render create-react-app"
```

And now, when you run `npm run build`, you'll get one file for each of your app's URLs!