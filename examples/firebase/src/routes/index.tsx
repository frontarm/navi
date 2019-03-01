import { lazy, mount, route } from 'navi'

const routes = mount({
  '/': lazy(() => import('./landing')),
})

export default routes