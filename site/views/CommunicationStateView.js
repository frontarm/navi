import './CommunicationStateView.less'
import React, { Component, PropTypes } from 'react'


const CommunicationStateView = ({ isLoading, error }) =>
  <div className={`
    CommunicationStateView
    CommunicationStateView-${error ? 'error' : (isLoading ? 'loading' : 'fresh')}
  `}>
    { isLoading &&
      <div className="CommunicationStateView-cube">
        <div className="CommunicationStateView-cube-c1"></div>
        <div className="CommunicationStateView-cube-c2"></div>
        <div className="CommunicationStateView-cube-c3"></div>
        <div className="CommunicationStateView-cube-c4"></div>
        <div className="CommunicationStateView-cube-c5"></div>
        <div className="CommunicationStateView-cube-c6"></div>
        <div className="CommunicationStateView-cube-c7"></div>
        <div className="CommunicationStateView-cube-c8"></div>
        <div className="CommunicationStateView-cube-c9"></div>
      </div>
    }
    { error &&
      <div className="CommunicationStateView-error">
        {error}
      </div>
    }
  </div>


export default CommunicationStateView


