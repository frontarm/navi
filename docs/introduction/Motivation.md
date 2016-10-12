# Motivation

Once upon a time, maybe 3 years ago, most buttons on a web page caused a request to be sent to a server in a far away land. The request's address and contents were encoded in a URL. Upon receipt of the request, the server then rendered a response as a HTML page and sent it back to your browser. We called this the information superhighway, and after the novelty wore off and that sounded kinda stupid, we called it "the web".

But let's fast forward to the modern world, where you're writing a modern JavaScript application. Instead of waiting for some machine on the other side of the planet, you now want to give your users *immediate* feedback each time they do something. And to make this happen, you've needed to decouple your client URLs from your backend URLs. **The URL the user sees is no longer an instruction to "GET this", but is just a map to some spot within your application.**

Application URLs have changed from an implementation detail to a UX optimization, but **the tooling hasn't caught up**. Routing tools still assume that you'll write your application *around* your Routes, instead of using Routes *within* your application. They still assume that your application's URL hierarachy will map *directly* to your view hierarchy, *preventing you from creating URLs which don't map directly to Views*. And they still assume that you're going to have a server somewhere which for some reason does *exactly the same thing as your client*.

Put simply -- Routers want to be the *core* of an app, but in client-side apps they just *aren't*. And don't take my word for it -- even react-router's authors think their API is ["fighting against React"](https://github.com/ReactTraining/react-router/commit/743832c559e7f9a5c8278c247e52730917333f82).

Junctions solve all this by *not* doing three things.
 
