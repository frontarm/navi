- The three principles of Junctions encourages us to manually pass location information down our component tree. Lack of state and lack of context prevent tooling from doing this for you
- But why manually thread data from the URL to each component when other libraries can do it for you?
- It turns out that manual passing doesn't have to be any more difficult than automatic passing. Given the increased clarity and simplicity, this makes doing it this way a no-brainer.
- But how can it be that manually and automatically passing state down the tree take the same amount of effort?
- **The key lies in how Junctions uses two types of data structure to refer to the same information: `Location`, and `Route`**.

## What are Locations and Routes?

- Let's start by pointing out the obvious. Locations are specific places. Routes are how you go to locations. On a map, you could represent the two as points and lines:

*image: points vs lines*

- But that's pretty general, so let's talk about something more specific to our use case

## What are *Application* Routes?

- they're the path which data takes as it enters your application as a URL, and flows down to components through props
- they're kind of like a state delivery route through your component tree
- each leg of the trip passes through a single component, dropping off whatever state is needed to let that component do its job.

*image: routes (multiple legs, each named by one or two URL segments) vs location (an entire URL)*

- we can actually put this information into a data structure
- the data structure is layered, like an onion
- each component peels off one layer, which contains the information for that component. It then uses that layer to choose a child component, and passes the rest of the onion along

*image: routes as onions*

- example: a route data structure

## Component-first Design

- one consequence of defining routes this way is that if we have a component tree, we know how to structure our route objects
- but this can be taken one step further. If we have a route object, we can create a URL
- for example, lets use the following rules:
  - one segment for the component name
  - further segments for any required props
  - any query parts can be taken when they're needed
  - a url path is just a list of legs of our journey, or layers of our onion
- now we don't need to bikeshed about URLs -- we can generate them from our component structure. We can follow component-first design instead of url-first design.
- example: given this component structure, create this URL
- so going from a route to a location is easy. But what about the other way?

## Routes from Locations

- A URL is just a list of route legs, so converting a URL to a route is just a matter of splitting the URL.
- But where do we split the URL?
- Unless we know the possible options, we can't know.

*image: split here or split here?*

- but there are only so components in an application, and thus only so many paths it can follow
- we can draw these as a decision tree
- and if we know which junction in that tree we're at, we can find whatever the next leg in our route is from the URL (or find that we don't know how to handle it at all)

*image: decision tree*
