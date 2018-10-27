import * as React from 'react'
import * as Navi from 'navi'
import { NavLink } from 'react-navi'

function Landing() {
  return (
    <div>
      <h1>Navi</h1>
      <ul>
        <li><NavLink href='/blog'>Blog</NavLink></li>
        <li><NavLink href='/tags'>Tags</NavLink></li>
      </ul>
    </div>
  )
}

export default Navi.createPage({
  title: 'Navi',
  getContent: () =>
    <Landing />
})