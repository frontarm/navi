const finalhandler = require('finalhandler')
const http = require('http')
const serveStatic = require('serve-static')
const chalk = require('chalk')

function serve({ port, root }) {
  // Serve up public/ftp folder
  var serve = serveStatic(root, {
    index: ['index.html'],
    extensions: ['html'],
  })

  // Create server
  var server = http.createServer(function onRequest(req, res) {
    serve(req, res, finalhandler(req, res))
  })

  console.log(chalk.cyan(`Starting server on port ${port} to view production build...`));

  // Listen
  server.listen(port)
}

module.exports = { serve }