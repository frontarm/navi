import * as Navi from 'navi'

export default Navi.page({
  title: "About",
  getBody: () => import('./document.mdx'),
})