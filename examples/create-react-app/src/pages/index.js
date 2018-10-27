import * as Navi from 'navi'
import blog from './blog'
import tags from './tags'

export default Navi.createSwitch({
  paths: {
    '/': () => import('./landingPage'),
    '/blog': blog,
    '/tags': tags,
  }
})