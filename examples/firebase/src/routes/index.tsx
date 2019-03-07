import { lazy, mount } from 'navi'

const routes = mount({
  '/': lazy(() => import('./landing')),
  '/login': lazy(() => import('./login')),
  '/register': lazy(() => import('./register')),
  '/logout': lazy(() => import('./logout')),
})

export default routes