import './PrismSourceView.less'
import React, { Component, PropTypes } from 'react'


const PrismSourceView = ({ html, busy }) =>
  <pre style={{fontSize: "12px"}} className='PrismSourceView'>
    <code dangerouslySetInnerHTML={{ __html: html }} />
  </pre>


export default PrismSourceView
