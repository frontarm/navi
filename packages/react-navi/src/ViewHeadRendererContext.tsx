import { Chunk } from 'navi'
import * as React from 'react'

export type ViewHeadRenderer = (chunks: Chunk[]) => React.ReactNode

export const ViewHeadRendererContext = React.createContext<null | ViewHeadRenderer>(
  null,
)
