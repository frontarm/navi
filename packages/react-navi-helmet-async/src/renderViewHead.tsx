import { Chunk, HeadChunk, TitleChunk } from 'navi'
import React from 'react'
import { Helmet } from 'react-helmet-async'

// Memoize these to stop a bizarre react-helmet infinite loop bug when titles
// are recreated on each render
const titles = {} as { [name: string]: React.ReactNode }
function createTitleElement(str: string) {
  let title = titles[str]
  if (!title) {
    title = titles[str] = <title>{str}</title>
  }
  return title
}

export default function renderViewHead(chunks: Chunk[]): React.ReactNode {
  let headAndTitleChunks = chunks.filter(
    chunk => chunk.type === 'title' || chunk.type === 'head',
  ) as ((HeadChunk | TitleChunk)[])
  let helmet =
    headAndTitleChunks &&
    headAndTitleChunks.length &&
    React.createElement(
      Helmet,
      null,
      ...headAndTitleChunks.map(chunk =>
        chunk.type === 'title'
          ? createTitleElement(chunk.title)
          : chunk.head.type === React.Fragment || chunk.head.type === 'head'
          ? chunk.head.props.children
          : chunk.head,
      ),
    )
  return helmet || null
}
