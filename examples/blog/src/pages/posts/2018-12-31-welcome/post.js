export default {
  title: `Congratulations on Your New Blog!`,
  tags: ['react', 'navi'],
  spoiler: "A test post about Navi",
  getContent: () => import('./document.mdx'),
}