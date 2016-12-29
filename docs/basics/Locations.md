# Locations

- A `Location` is an object which contains one possible value of your app's Navigation State.
- Its information is structured the same way the Browser stores navigation state -- i.e. as a URL and single arbitrary state object.

- Example of location

- Location objects are useful or when you need to interact with the browser.
- Examples: pushState, finding current state

- The format of `Location` objects is shared with the history package
- While you don't have to use the history package, it often makes interacting with browser APIs a lot simpler.

- For small applications, we can do all our routing with Locations alone. We cover this in "Do I Really Need A Router?"
- But as an app grows, getting the data from your `Location` into the correct component can be a hassle.
- This is where structured routes come in handy.
