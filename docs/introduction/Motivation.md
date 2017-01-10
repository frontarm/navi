---
title: Motivation
---

# Motivation

It was pretty normal day in Tokyo when I received a request from a client. "I'd like this application screen to be a React Component. And I want it to be reusable." 

Given my client's app was created with React, I naturally said "Yes Sir". I mean, the best part about React is that components are reusable. What could go wrong?

The answer is *Links*. Links are what could go wrong.

You see, the thing about the *web* is that it is made of URLs. And the thing about URLs is that they don't compose. But reusable components need to compose.

To demonstrate, imagine that you'd like to make a self contained `PaymentsScreen` component, like so:

```js
class PaymentsScreen extends Component {
    static propTypes = {
        path: PropTypes.oneOf(['/new', '/list']),
    }

    render() {
        return (
            <div>
                <nav>
                    <a href='/new'>Add Payment</a>
                    <a href='/list'>List</a>
                </nav>
                <div>
                    Hi!
                </div>
            </div>
        )
    }
}
```

Easy, right? Except -- what if you want to mount this component somewhere other than the application root? The `<a>` tags are going to break.

But you've got you're head screwed on, so you know how to fix this. Just pass in a `basePath`.

```js
<a href=`${basePath}/new`>Add Payment</a>
<a href=`${basePath}/list`>List</a>
```

And this works. Until you want to mount this component within a modal which doesn't *have* URLs. *Don't mount it in a modal, you say*. But your client insists. Now what?

*You're up the creek with no paddle.* That's what.

## Components With URLs Aren't Reusable

Routable components have Links. Links point to URLs. And URLs cause components to be dependent on their environment. *So perhaps we should just give up on reusability for any components with links?*

But wait a minute. The great thing about React is that it lets you write reusable components. And the great thing about the web is that all its content has URLs. So wouldn't be ideal if you could have your cake and eat it too?

This is the question that led to Junctions. And happily, it turns out that you *can* have your cake and eat it too! You just need to make sure that your routing library follows [Three Principles](three-principles).


