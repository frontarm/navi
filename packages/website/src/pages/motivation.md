The Motivation behind Navi
==========================

Navi lets you create big, fast, CDN-delivered websites with great SEO & SMO, and all with vanilla create-react-app. But *why*? To find out, let's talk business.


It's Business Time
------------------

On the modern web, the majority of **traffic comes from search engines and social media**. If you want your site to be seen by anyone, then you need to design for SEO and SMO -- there's really no way around it.

Now if you were building an old-school \P\H\P or Rails app, SEO and SMO would be easy -- you'd just add some meta tags to the `<head>` of your HTML files. But **the future belongs to React**, and create-react-app only gives you a single HTML file to play with. **So where do your page-specific meta tags go?!**

You might ask, *perhaps we don't need meta tags anymore?* After all, Google is pretty smart -- it can probably figure out some relevant info without them. But while this might work for a hobby, it doesn't work when you have bills to pay. **You can't lose control over how your site is presented when your traffic depends on it.**

Luckily, there's a fix. By implementing static or server rendering, you'll be able to serve page-specific metadata and **regain control over SEO and SMO**. And while it used to be that doing so meant ejecting from create-react-app and writing a *ton* of code, Navi makes it ridiculously easy.

And there's a surprisingly simple reason that Navi is able to accomplish this.


Navi ❤️ Async
-------------

- aside: What about React Suspense?

The React team is planning to improve React's handling of async data with an elegant new API called *Suspense*. Navi is designed with React Suspense in mind, so when Suspense arrives, your Navi-based will instantly grow a bunch of new abilities.

With this in mind, React's [roadmap](https://reactjs.org/blog/2018/11/27/react-16-roadmap.html) does not yet give an estimate for when static and server rendering will be ready. It may take a while, and Navi can tide you over until it's ready.
 
- end aside


If you take a look around the industry, **the vast majority of real-world apps rely on some kind of asynchronous data** -- whether it's fetched from an API, pulled from a database, or dynamically imported from other JavaScript files. And for the most part, React handles this asynchronous data pretty well; component state makes it easy to show a loading spinner until the data is ready.

In fact, there's a whole ecosystem of [routing](https://github.com/ReactTraining/react-router) [tooling](https://npmjs.com/package/react-helmet) that relies on component state to handle asynchronous data. But here's the thing: **outside of the browser, component state just plain doesn't work** -- and neither do the tools that rely on it.

But Navi? It works *perfectly* without component state. It's built with vanilla JavaScript, and is asynchronous to its core. **Navi works with async data both in *and* out of a browser** -- and this is crucial when generating HTML for crawlers.


Crawlers need HTML
------------------

In order to control your SEO and SMO destiny, **you'll need to serve meaningful HTML for each of your site's URLs**. To do this, you'll need some way to generate that HTML, and there are broadly two approaches:

1. *Crawl the site yourself with a tool like [react-snap](https://github.com/stereobooster/react-snap), generating static HTML pages as you go.*

  But while this approach sounds simple, it's actually fraught with problems. It doesn't scale, it sometimes misses pages, it can't deal with authentication or paywalls, and worst of all, it will start by presenting your user with the full content, before *nuking it* and loading everything from scratch. So let's move on to option two.

2. *Use the `ReactDOMServer.renderToString()` function, which takes an element -- for example, your `<App />` element -- and returns the initial markup as a string.*

If you're working with asynchronous data, then you want option two. In fact, you don't even need to write any code to use option two, because the navi-scripts package uses `renderToString()` internally, letting you generate your entire site's HTML files with a single shell command.

```bash
# Builds your app with create-react-app, then
# generates static HTML files for each page
npx react-scripts build && npx navi-scripts build
```

*But if `navi-scripts` can generate HTML with `renderToString()`, why can't react-router and react-helmet?* To answer, let me ask you another question: *what does the initial markup look like for a page that loads async content?*

```image
renderToString -> loading spinner
```

**`renderToString()` returns the first thing that your component renders.** If your component renders a loading spinner until its content is available, then `renderToString()` will return... a loading spinner.

So what's the secret sauce? With Navi, your page content is just a promise that you can `await` before calling `renderToString()` -- making SEO a walk in the park!

```js
img: get content -> renderToString(<App content={content}> -> page!
```

Now to be fair, you could do the same with react-router -- you'd just have to manage all that gnarly asynchronous content by yourself. But with Navi, you **just map URLs to `async` functions, and Navi handles the rest**. Believe it or not, it actually makes async routing fun! But it does come with a catch.


Navi is built for the web
-------------------------

> "Always bet on the web"
> 
> -- <cite>Tom Dale</cite>, <small>JavaScript thinkfluencer</small>

Navi assumes that you're building for the web. It does not -- and will not -- support react-native. And while this means that there are some things that Navi *can't* do, it also means that if you're building for the web, then Navi is designed *just for you*:

- Instead of declaring abstract "routes", you declare **pages** with title, content and meta.
- Deep linking to headings with `#` links works out of the box, making sharing easy.
- Your routing tree is statically analyzable, allowing you to generate maps of all of your site's URLs and their metadata
- Static HTML generation is just a shell command away
- You'll even get warnings when a `<Link>` component points to a 404!

There's just one last thing: while this sounds great and all, how do you know that it'll actually work? Well as it happens, you're using Navi right now! You see, Navi started its life as the routing code for Frontend Armory. It's the reason that this site is snappy, interactive, and social-media friendly -- just click this button to see for yourself:

- Twitter embed

[Continute to core concepts &raquo;](/core-concepts)



