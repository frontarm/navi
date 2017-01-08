module.exports = {
  title: 'About The Examples',
  indexWrapper: 'MenuWrapper',
  index: [
    require('./Raw.example.js').set({
      title: 'Raw'
    }),
    require('./Basic.example.js').set({
      title: 'Basic'
    }),
    require('./BaseLocation.example.js').set({
      title: 'Base Location',
      initialPath: '/mountpoint',
    }),
  ]
}
