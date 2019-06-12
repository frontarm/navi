declare module '@mdx-js/react' {
  export const MDXProvider: any;
}

declare module '*.mdx' {
  const Document: any
  export default Document
}