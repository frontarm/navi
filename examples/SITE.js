module.exports = {
  title: 'About The Examples',
  indexWrapper: 'MenuWrapper',
  index: [
    require('./Basic.example.js').set({
      title: 'Basic'
    }),
    require('./Raw.example.js').set({
      title: 'Raw'
    }),
    require('./BaseLocation.example.js').set({
      title: 'Base Location',
      initialPath: '/mountpoint',
    }),
  ]
}
