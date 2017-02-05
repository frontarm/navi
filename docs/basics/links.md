**Note: The Guide is still only an outline. [Pull Requests](https://github.com/jamesknelson/junctions) would be greatly appreciated!**

# Links

- *Junctions* aims to make as few assumptions about your environment as possible.
- In fact, Junctions does not assume you're using React. It should be perfectly possible to use Junctions with Vue, Angular, or any other component-based framework.
- One side-effect of this philosophy is that the core junctions package does not include a `<Link>` component.

- One solution to this is to roll your own Link.
- Because link components only need to communicate with your browser -- not junctions itself -- you can expect that the API will be stable for a very very long time

- But if you'd prefer to use something which already exists, we provide a separate react-junctions package which contains a `<Link>` component.
- This component assumes you're using the history package for navigation, and uses pushState to update that history with the Location you specify.

**TODO: example**

- And because passing a history to every link is less than ideal, the package also provides a HistoryContext component to make your history object available to Links throughout the application.

**TODO: example**

## But how do I know what Location to pass?

- You might have noticed in the above examples that the Location we pass is hard-coded.
- For small applications, this works fine. Even if your routes are *technically* relative, components with a set location in your application are *effectively* absolute. If you know where they're going to be mounted, using hard-coded URLs is simple and effective.

- But what about for larger applications, where you want your screen components to be *truly* independent?
- Or what if you genuinely don't know where your Screen will be mounted?
- In this case, you can't specify a Location for your Link, because *you don't know what it will be*
- But this doesn't change the fact that the *browser* needs a Location. Even if you can create a Route, the browser won't understand it.
- In cases like this, you need a way to convert a relative Route into a Location which you can pass to links. Or in our terminology, we'll need a way to Locate Routes.


