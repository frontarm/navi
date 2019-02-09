import * as Navi from 'navi'

export default Navi.route({
  title: "About",
  getView: () => import('./document.mdx'),
})