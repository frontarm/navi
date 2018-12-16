declare module '@mdx-js/tag' {
  export const MDXTag: any;
  export const MDXProvider: any;
}

declare module '*.mdx' {
  const Document: any
  export default Document
}