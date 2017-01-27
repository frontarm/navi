import React, { Component } from 'react'
import { PageContentLoader } from 'sitepack'
import MarkdownView from '../views/MarkdownView'
 

export default class MarkdownWrapper extends Component {
  componentDidMount() {
    document.title = this.props.page.title + ' - Junctions'
  }

  componentDidUpdate() {
    document.title = this.props.page.title + ' - Junctions'  
  }

  render() {
    const { currentLocation, page, navigateToPath } = this.props
  
    return (
      <PageContentLoader
        page={page}
        render={
          <MarkdownView
            currentLocation={currentLocation}
            title={page.title}
            onClickLink={navigateToPath}
          />
        }
      />
    )
  }
}
