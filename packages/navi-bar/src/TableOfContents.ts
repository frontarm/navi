export type TableOfContents = TableOfContentsItem[]

export interface TableOfContentsItem {
  id
  level: number
  title: React.ReactNode
  children: TableOfContents
}