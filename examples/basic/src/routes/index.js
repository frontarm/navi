import { lazy, mount, route } from 'navi'

const routes = mount({
  '/': route({
    // Add a title to the route, which will be automatically used as
    // the document's `<title>`.
    title: 'Home',
  
    // Define the content which will be rendered in place of the react-navi
    // `<View />` component. Dynamically import the view, so that it isn't
    // loaded until needed.
    getView: () => import('./home/view')
  }),
    
  // Dynamically import the entire '/about' route, so that it isn't loaded
  // until needed.
  '/about': lazy(() => import('./about/route')),
})

export default routes