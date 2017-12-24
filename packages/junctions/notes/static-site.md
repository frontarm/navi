// building static site:
// 1. bundle the app for web, exporting a `junction` object and `main` function
//    instead of immediately running an entry point.
// 2. load the app within node with a fake browser, spy on
//    document.createElement to watch for loaded chunks, and walk through the
//    junction to build a list of chunks required by each URL
// 3. for each URL, call a `renderToString` method from a different file, with
//    a URL and the root junction object. Take the output, and wrap it in
//    a HTML file with `<script>` tags to pre-emptively load any of the
//    dependencies. For URLs that are redirects, create a file with the 
//    extension .redirect (which will be removed by the server), whose content
//    is the URL to redirect to.
// 4. for the chunks corresponding with Junction objects or junction content,
//    create a headers file that tells Cloudflare which dependency chunks to
//    push in the case that HTTP/2 is supported.

// => the main requirement from the bundler is that there is a way to instrument the `import`
//    statements in the generated code, so that we can record what chunks are being loaded at runtime

//    * it appears that parcel-bundler does this via document.createElement -
//      so can probably just stub that within the node environment?
//    * note: we shouldn't need a full fake dom, as the node walker shouldn't
//      actually render anything other than script/link tags...


It should be possible to just bundle the app for web using Parcel or
Webpack, without any other special tooling. The only conditions are:

- make sure the app exports a root junction
- make sure the app doesn't run everything immediately (instead export `main`,
  and call that as an extra entry point in dev, or from the generated static
  code)
- have a *separate* renderToString file (separate, as we don't want to need
  to include React's server side rendering stuff in the public app)

Then, the static site generation tool can set up a fake dom env, intercept any
calls to load scripts and replace everything else with noops, and then
iterate through the root junction, creating a page and list of dependencies
for each URL.