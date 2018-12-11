import { Document } from '../document'


The Motivation behind Navi
==========================

Navi lets you create big, fast, CDN-delivered websites with great SEO & SMO, and all with vanilla create-react-app.


It's Business Time
------------------

Businesses live and die on their web traffic. And on the modern web, the majority of **traffic comes from search engines and social media**. If you want your site to be seen by anyone, then you need to design for SEO and SMO -- there's really no way around it.

Now if you were building an old-school \P\H\P or Rails app, SEO and SMO would be easy -- you'd just add some meta tags to the `<head>` of your HTML files. But say that you've spun up a project with create-react-app. There's just a *single* HTML shared file between every page. **So where do your page-specific meta tags go?!**

You might ask, *perhaps we don't need meta tags anymore?* After all, Google is pretty smart -- it can probably figure out some relevant info without them. But while this might work for a hobby, it doesn't work when you have bills to pay. **You can't lose control over how your site is presented when your traffic depends on it.**

Luckily, there's a fix. By implementing static or server rendering, you'll be able to serve page-specific metadata and **regain control over SEO and SMO**. And while it used to be that doing so meant ejecting from create-react-app and writing a *ton* of code, Navi makes it ridiculously easy.

And there's a surprisingly simple reason that Navi is able to accomplish this.


Navi ❤️ Async
-------------

<Document.AsideOrAfter
  aside={
    <Document.Details title="What about React Suspense?">
      <p>
        The React team is planning to improve React's handling of async data with an elegant new API called <em>Suspense</em>. Navi is designed with React Suspense in mind, so when Suspense arrives, your Navi-based will instantly grow a bunch of new abilities.
      </p>
    </Document.Details>
  }
>

If you take a look around the industry, **the vast majority of real-world apps rely on some kind of asynchronous data** -- whether it's fetched from an API, pulled from a database, or dynamically imported from other JavaScript files. And for the most part, React handles this asynchronous data pretty well; component state and lifecycle methods make it easy to show a loading spinner until the data is ready. But here's the thing...

</Document.AsideOrAfter>

**Outside of the browser, component state and lifecycle methods just plain don't work** -- and neither do the tools that use them. This is because React takes a completely different approach to rendering; on the browser, you call `ReactDOM.render()`, while on the server, you call `ReactDOMServer.renderToString()`. And while `renderToString()` will happily render your page's initial content, this doesn't help when the initial content is a loading spinner.

image: renderToString -> spinner
caption: renderToString() can only render the initial data

So what’s the secret sauce? Navi isn't just a router; it's a loader too! It lets you **declare how URLs map to content using `async` functions, and then `await` the result before rendering.**

image: renderToString(await content) -> spinner
caption: renderToString() Navi moves your page's dependencies

By avoiding a mess of component state and lifecycle methods, Navi makes SEO with `renderToString()` a walk in the park! But that's not all it does...


Navi is built for the web
-------------------------

> "Always bet on the web"
> 
> -- <cite>Tom Dale</cite>, <small>JavaScript thinkfluencer</small>

Navi assumes that you're building for the web. It does not -- and will not -- support react-native. And while this means that there are some things that Navi *can't* do, it also means that **it makes creating websites and web apps ridiculously easy.**

- Instead of declaring abstract "routes", you declare **pages** with title, content and meta.
- It sets the page `<title>` as the user navigates.
- Deep linking to headings with `#` links works out of the box.
- Your routing tree is statically analyzable, allowing you to generate maps of all of your site's URLs and their metadata.
- It includes a tool for statically rendering create-react-app projects.
- You'll even get warnings when a `<Link>` component points to a 404!

There's just one last thing: while this sounds great and all, how do you know that it'll actually work? Well as it happens, you're using Navi right now! You see, Navi started its life as the routing code for Frontend Armory. It's the reason that this site is snappy, interactive, and social-media friendly -- just click this button to see for yourself:

- Twitter embed

[Jump into the Minimal Example &raquo;](/guides/minimal-example)



