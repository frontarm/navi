#!/usr/bin/env node
const init = require('initit')

const [name = 'react-blog'] = process.argv.slice(2)

init({ name, template: `frontarm/navi/examples/create-react-blog` })
  .then(res => process.exit(0))
  .catch(err => {
    console.log(err)
    process.exit(1)
  })