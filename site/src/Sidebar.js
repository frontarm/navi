import React from 'react'
import { Link } from 'react-junctions'
import logo from './logo.svg'
import './Sidebar.css'


export const Sidebar = ({ className='', env }) =>
  <div className={"Sidebar "+className}>
    <Link env={env} href='/' className="Sidebar-brand">
      <img src={logo} className="Sidebar-brand-logo" alt="logo" />
      <span className="Sidebar-brand-title">Junctions</span>
    </Link>

    <nav className="Sidebar-nav">
      <section>
        <NavLink env={env} href="/" className="Sidebar-nav-heading">Junctions</NavLink>
        <NavLink env={env} href="/why-another-router/">Why another router?</NavLink>
        <NavLink env={env} href="/why-another-static-site-generator/">Why another static generator?</NavLink>
      </section>
      
      <section>
        <div className="Sidebar-nav-heading">Guides</div>
        <NavLink env={env} href="/tutorial/">Tutorial: Make this site</NavLink>
        <NavLink env={env} href="/static-sites-with-create-react-app/">Static builds with create-react-app</NavLink>
      </section>

      <section>
        <NavLink env={env} href="/api-reference/" className="Sidebar-nav-heading">API Reference</NavLink>
        
        <div className="Sidebar-nav-subheading">Templates</div>

        <HashLink env={env} href="/api-reference/#createPageTemplate">createPageTemplate</HashLink>
        <HashLink env={env} href="/api-reference/#createRedirectTemplate">createRedirectTemplate</HashLink>
        <HashLink env={env} href="/api-reference/#createJunctionTemplate">createJunctionTemplate</HashLink>

        <div className="Sidebar-nav-subheading">Components</div>

        {/*<ComponentLink
          env={env}
          href="/api-reference/#ExitPrompt"
          name='ExitPrompt'
          props={[
            ['env', 'env?: { navigation }'],
            ['message-string', 'message: string'],
            ['message-func', 'message: func'],
            ['when', 'when?: bool'],
          ]}
        />*/}

        {<ComponentLink
          env={env}
          href="/api-reference/#JunctionActiveChild"
          name='JunctionActiveChild'
          props={[
            ['busyElement', 'busyElement?: ReactElement'],
            ['errorElement', 'errorElement?: ReactElement'],
            ['junction', 'junction: Junction'],
            ['notFoundElement', 'notFoundElement?: ReactElement'],
          ]}
        />}

        <ComponentLink
          env={env}
          href="/api-reference/#JunctionNavigation"
          name='JunctionNavigation'
          props={[
            ['announceTitle', 'announceTitle?: func'],
            ['setDocumentTitle', 'setDocumentTitle?: func'],
            ['followRedirects', 'followRedirects?: bool'],
            ['history', 'history?: History'],
            ['render', 'render?: func'],
            ['root', 'root: JunctionTemplate'],
            ['waitForInitialContent', 'waitForInitialContent?: bool'],
          ]}
        />

        <ComponentLink
          env={env}
          href="/api-reference/#Link"
          name='Link'
          props={[
            ['active', 'active?: bool'],
            ['activeClassName', 'activeClassName?: string'],
            ['activeStyle', 'activeStyle?: object'],
            ['env', 'env?: { navigation }'],
            ['exact', 'exact?: string'],
            ['href', 'href: string'],
          ]}
        />

        <div className="Sidebar-nav-subheading">Types</div>

        <HashLink env={env} href="/api-reference/#Junction">Junction</HashLink>
        <HashLink env={env} href="/api-reference/#Page">Page</HashLink>
      </section>

      <section>
        <NavLink env={env} href="https://github.com/jamesknelson/junctions" className="Sidebar-nav-heading">GitHub &raquo;</NavLink>
      </section>
    </nav>
  </div>


const NavLink = ({ children, className='', env, href }) =>
  <Link
    activeClassName='Sidebar-NavLink-active'
    className={'Sidebar-NavLink '+className}
    env={env}
    href={href}
    exact>
    {children}
  </Link>

const HashLink = ({ children, className='', env, href }) =>
  <Link
    className={'Sidebar-HashLink '+className}
    env={env}
    href={href}
    exact>
    {children}
  </Link>

const ComponentLink = ({ env, href, name, props }) =>
  <div className='Sidebar-ComponentLink'>
    <HashLink env={env} href={href}>&lt;{name}&gt;</HashLink>
    {/*props.map(([id, label]) => 
      <HashLink
        key={id}
        env={env}
        href={href+'-'+id}
        className="Sidebar-nav-prop">
        {label}
      </HashLink>    
    )*/}
  </div>