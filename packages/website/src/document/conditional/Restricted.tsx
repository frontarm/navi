import React from 'react'
import { DocumentContext } from '../DocumentContext'
import { HideWhenStatic } from './HideWhenStatic'

export interface RestrictedProps {
  children: React.ReactNode
  restricted: React.ReactElement<any>
}

export class Restricted extends React.Component<RestrictedProps> {
  static contextType = DocumentContext

  render() {
    return (
      <HideWhenStatic>
        {this.context.canAccessRestrictedContent ? this.props.children : this.props.restricted}
      </HideWhenStatic>
    )
  }
}