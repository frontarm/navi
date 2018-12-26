import React from 'react'
import { NavLink } from 'react-navi'
import BlogContext from '../BlogContext'
import styles from './BlogIndexPage.module.css'

function BlogIndexPage(props) {
  return (
    <BlogContext.Consumer>
      {({pathname, title}) =>
        <div styles={styles.BlogIndexPage}>
          <h1>
            <NavLink href={pathname}>{title}</NavLink>
          </h1>
          <ul>
            {props.posts.map(post =>
              <li key={post.href}>
                <NavLink href={post.href}>{post.route.title}</NavLink>
              </li>  
            )}
          </ul>
          <footer>
            <div className={styles.pagination}>
              <p>Page {props.pageNumber} / {props.pageCount}</p>
              {
                props.pageCount > 1 &&
                <p>
                  {
                    props.pageNumber !== 1 &&
                    <NavLink href={props.getPageHref(props.pageNumber - 1)}>&laquo; Previous </NavLink>
                  }
                  {
                    props.pageNumber < props.pageCount &&
                    <NavLink href={props.getPageHref(props.pageNumber + 1)}> Next &raquo;</NavLink>
                  }
                </p>
              }
            </div>
            <div className={styles.links}>
              <a
                href='./rss.xml'
                target='_blank'
                style={{ float: 'right' }}>
                RSS
              </a>
              <NavLink href='./about'>
                About
              </NavLink> &bull;{' '}
              <NavLink href='./tags'>
                Tags
              </NavLink> &bull;{' '}
              <a href='https://github.com/frontarm/navi/tree/master/examples/blog'>
                Source
              </a>
            </div>
          </footer>
        </div>
      }
    </BlogContext.Consumer>
  )
}

export default BlogIndexPage