import * as Navi from 'navi'

export default Navi.createPage({
  title: "About",
  getContent: () => import('./document.mdx'),
})