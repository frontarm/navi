export default {
  title: `Congratulations on Your New Blog!`,
  tags: ['example'],
  spoiler: "A test post about Navi",
  getContent: () => import('./document.mdx'),
}