import { Chunk, HeadChunk, TitleChunk } from 'navi'
import * as React from 'react'
import { Helmet } from 'react-helmet'
import { ViewHeadRendererContext } from 'react-navi'

interface HelmetProviderProps {
  canUseDOM?: boolean
  children: React.ReactNode
  context?: any
}

export function HelmetProvider({
  canUseDOM,
  context,
  children,
}: HelmetProviderProps): React.ReactElement<any> {
  // react-helmet thinks it's in a browser because of JSDOM, so we need to
  // manually let it know that we're doing static rendering.
  if (canUseDOM !== undefined) {
    Helmet.canUseDOM = canUseDOM
  }

  if (context && !Helmet.canUseDOM) {
    context.getHelmet = () => {
      return Helmet.renderStatic()
    }
  }

  return (
    <ViewHeadRendererContext.Provider value={renderViewHead}>
      {children}
    </ViewHeadRendererContext.Provider>
  )
}

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

export function renderViewHead(chunks: Chunk[]): React.ReactNode {
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

// If building with navi-scripts, we'll need to register this module so that
// it can use it to add <head> tags to the build output.
if (typeof window !== 'undefined') {
  let app = window['NaviScripts']
  if (!app) {
    app = window['NaviScripts'] = {}
  }
  if (!app.head) {
    app.head = HelmetProvider
  }
}

export default HelmetProvider
