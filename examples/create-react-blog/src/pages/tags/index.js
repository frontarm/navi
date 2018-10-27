import * as Navi from 'navi'
import { fromPairs } from 'lodash'
import { createTagIndexPage } from './createTagIndexPage'
import { createTagPage } from './createTagPage'

const TAGS = [
  'Navi',
  'React',
]

export default Navi.createContext(
  env => ({
    ...env.context,
    tagsPathname: env.pathname,
  }),
  Navi.createSwitch({
    paths: {
      '/': createTagIndexPage(TAGS),

      ...fromPairs(
        TAGS.map(tag => [
          '/'+tag.toLowerCase(),
          createTagPage(tag)
        ])
      )
    },
  })
)
