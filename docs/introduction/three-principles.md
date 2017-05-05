[The Junctions Router](https://junctions.js.org) was originally designed in response to the requirements of a  production React application. And as it turns out, these same requirements can be summarised as a haiku.

> Components compose

> Browsers show "Back" and "Forward"

> Get outta' the way!

So why exactly are these three principles important enough to warrant a haiku? Let's take a look at each in turn to find out.

## Components Compose

React is a wonderful tool for making parts of your code reusable, owing in large part to its component system. But perhaps *because* React makes creating new components so easy, it can also be easy to forget that there are still problems which componentization can't solve. In particular, components still have access to a shared environment -- and they can use that environment in ways that don't play well with others. Or in mathy jargon, *components are not guaranteed to compose*.

The goal of Junctions is to allow you to write truly reusable components, and part of that is to be able to compose them whichever way you'd like. *But URLs are a shared resource*, and **allowing components to take ownership of URLs willy-nilly can lead to chaos**.

To demonstrate, consider an application which renders two components:

- A set of tabs for the application's navigation
- A modal with the current user's account details

![Parallel Routes Wireframe](http://jamesknelson.com/wp-content/uploads/2017/02/parallel-routes-wireframe.png)

These components *should be* completely independent -- in fact, the account details modal component could be reused across any number of applications! But because both components have navigation controls, they need to share the same URL space. And this can cause conflicts.

In order to follow the principle that *Components Must Compose*, components which use Junctions for routing avoid taking ownership of any shared resources. In particular:

- Components never access routing data through [React Context](https://facebook.github.io/react/docs/context.html#why-not-to-use-context)
- Components don't choose their own URLs (but can still suggest them)

Of course, there is no avoiding the fact that components still need access to shared resources. **The difference with Junctions is that these resources are allocated by your application -- not by your components.**

## Browsers show "Back" and "Forward"

If there is one constant over the short history of the web browser, it is that the "Back" and "Forward" buttons have been -- and always will be -- important.

![Netscape 1.22](http://jamesknelson.com/wp-content/uploads/2017/02/netscape-1.22.png)
<center><small>Netscape Navigator 1.22, with "Back" and "Forward"</small></center>

These two simple buttons hold the distinction of being perhaps the most well understood pieces of web UI in existence. They're incredibly useful, uniquely ubiquitous, and with Javascript, frustratingly easy to break. And with this in mind, properly supporting "Back" and "Forward" was woven into Junctions' design from the beginning.

But what does this mean for you, as a developer? Well, Junctions avoids introducing any new state to your application. In order to ensure that "Back" and "Forward" work as planned, ***all* navigation state needs to be stored within standard browser APIs**:

```js
// Stores all the information in your browser's address bar
window.location

// A JavaScript object which can be updated with
// `History.pushState`, allowing arbitrary data to be stored
History.state
```

With no state to manage, Junctions-based applications are *simple*. All your routing data is available at the application root, and Routing information is passed to your components the way God and The React Devs intended -- via `props`.

But isn't this simplicity limiting? Not at all! The thing is that the browser History API isn't limited to URLs; it also supports `state` objects. And given your Junctions-based components don't allocate their own Locations anyway, **navigation will use URLs when possible, and `state` when necessary**. So you can have your cake, and eat it too!

## Get outta' the way!

One of the things about routing tools is that they're often at the core of your application. After all, the URL bar is at top of the browser. Your `history` object is probably one of the first things you instantiate. And your application can't do *anything* if it doesn't know what the user wants to see.

So you can see how this might go to the head of someone making a routing library. Not only do they get to control an important part of your project; by limiting how routing data can be accessed, their API can dictate *the structure of your entire application!* And as a number of react-router users have discovered, **if the router API changes -- your application will need to change too**.

Junctions avoids these issues by being completely agnostic as to how you use your routing data. It gives you one single method to convert your URL into a tree of routes. And once the conversion is complete, you can use your routing data however you'd like!

- You can use it directly at the application root
- You can pass it explicitly where it needs to go, via `props`
- You can create some Context-based helpers (like react-router)

But the best part? The conversion of your entire URL into `Route` objects can take place *outside* of any React component tree. This means that **Junctions will *never* get in the way of React.** Or Vue. Or Angular. Or whatever framework you choose to use it with.

Now to be clear, this flexibility does come at a cost: out of the box, Junctions-based components are a tad more verbose than those written with competing routers. But to mitigate this, you get packages to integrate with frameworks, and docs which contain examples to follow. And even without these tools, *flexibility is less of a problem than you may think.* Because **Junctions gives you back control**. It lets you add your own sugar, so your routing is not too bland, not too sweet -- but just perfect for you. Which sounds great and all, but [how exactly does Junctions manage this?](what-you-get-from-junctions.md)

