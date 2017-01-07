module.exports = {
  title: 'About The API',
  content: require('./README.md'),
  indexWrapper: 'MenuWrapper',
  index: [
    require('./README.md'),
    require('./junctions/SITE.js'),
    require('./react-junctions/SITE.js'),
    //require('./react-router-junctions/SITE.js'),
  ],
}
