import './PrismSourceView.less'
import React, { Component, PropTypes } from 'react'


const PrismSourceView = ({ content, isLoading }) =>
  <pre style={{fontSize: "12px"}} className='PrismSourceView'>
    <code dangerouslySetInnerHTML={{ __html: content }} />
  </pre>


export default PrismSourceView
