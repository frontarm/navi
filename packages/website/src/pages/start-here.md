Navi
====

*Blazing fast websites with vanilla create-react-app.*

🚀 Easy SEO with static HTML for each page<br />
🔥 Ergonomic code splitting and page loading transitions<br />
🗺️ Generate JSON site maps at runtime or build time<br />
👌 A dead-simple API<br />
🏷️ Great TypeScript support<br />
📜 Scroll management that just works<br />
♿️ Page `<title>` management for accessibility<br />
⚠️ Console warnings when a `<Link>` points to a 404<br />

*Just getting started?*

- [Why Navi?](/motivation)
- [Jump into the minimal example &raquo;](/guides/minimal-example)
- [Play with the demoboard &raquo;](https://frontarm.com/demoboard/?id=1229d493-ffaf-4133-b384-0f7dfec85af5)

<!-- - [Start a project with create-navi-app &raquo;]() -->

Packages
--------

### navi

The `navi` package contains Navi's core functionality, and works with any other library or framework -- including React, Vue, Express, Vanilla JS and even react-router!

```bash
# For defining pages and matching routes
npm install --save navi
```


### react-navi

The `react-navi` package provides a bunch of helpful React components.

```bash
# For components that integrate with React
npm install --save react-navi
```

For more details, check out the [components reference &raquo;](/reference/react-components)


### navi-scripts

The `navi-scripts` package facilitates SEO by generating static HTML for each of your app's pages.

```bash
# For static site generation
npm install --save-dev navi-scripts
```

If you're using `create-react-app`, **setting up `navi-scripts` just takes a one line change in your package.json**. To learn how, click through to the [static rendering guide &raquo;](/guides/static-rendering)

<!--
### create-navi-app

TODO

- it's easy to set up a navi app using create-react-app, you only need to make 3 changes
- the first time you create a navi app, it's worth making those changes yourself, as it helps you build understanding
- but the next time? save yourself the time and just use create-navi-app. it generates an app that:

- has the navi, react-navi and navi-scripts packages pre-installed
- has the `build` script configured to output static html
- comes with a `/pages` directory and an index route
- renders the current route within `<App>`
- adds the required bootstrap code to `index.js`
-->

Who uses Navi?
--------------

- [Frontend Armory](https://frontarm.com)
- *Do you use Navi? [Edit this page!](https://github.com/frontarm/navi/edit/master/packages/website/src/pages/start-here.md)*


License
-------

Navi is MIT licensed.
