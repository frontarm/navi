import React, { Component } from 'react'
import { PageContentLoader } from 'sitepack'
import MarkdownView from '../views/MarkdownView'
 

const MarkdownWrapper = ({ page, hash, navigateToPath }) => 
  <PageContentLoader
    page={page}
    render={
      <MarkdownView
        title={page.title}
        hash={hash}
        onClickLink={navigateToPath}
      />
    }
  />

export default MarkdownWrapper
