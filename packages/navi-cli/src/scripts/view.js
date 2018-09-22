import finalhandler from 'finalhandler'
import http from 'http'
import serveStatic from 'serve-static'
import chalk from 'chalk'


export default function({ port, directory }) {
  // Serve up public/ftp folder
  var serve = serveStatic(directory, {
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
