import { Chunk, HeadChunk, TitleChunk } from 'navi'
import * as React from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { ViewHeadRendererContext } from 'react-navi'

interface NaviHelmetProviderProps {
  canUseDOM?: boolean
  children: React.ReactNode
  context?: any
}

function NaviHelmetProvider({
  canUseDOM,
  context,
  children,
}: NaviHelmetProviderProps): React.ReactElement<any> {
  let parent = React.useContext(ViewHeadRendererContext)
  let { current: defaultContext } = React.useRef({})

  if (!context) {
    context = defaultContext
  }

  // react-helmet may thinks it's in a browser due to JSDOM, so we need to
  // manually let it know that we're doing static rendering.
  if (canUseDOM !== undefined) {
    ;(HelmetProvider as any).canUseDOM = canUseDOM
  }

  if (!(HelmetProvider as any).canUseDOM) {
    context.getHelmet = () => {
      return context.helmet
    }
  }

  if (parent) {
    // If someone has already wrapped the app with a HeadProvider, e.g. for
    // server side rendering, then just use that.
    return <>{children}</>
  } else {
    return (
      <HelmetProvider context={context}>
        <ViewHeadRendererContext.Provider value={renderViewHead}>
          {children}
        </ViewHeadRendererContext.Provider>
      </HelmetProvider>
    )
  }
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
    app.head = NaviHelmetProvider
  }
}

export { NaviHelmetProvider as HelmetProvider }
export { Helmet }

export default NaviHelmetProvider
