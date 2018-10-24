import React from 'react'
import * as Nav from 'react-navi'
import logo from './logo.svg'
import './Sidebar.css'


export const Sidebar = ({ className='' }) =>
  <div className={"Sidebar "+className}>
    <Nav.Link href='/' className="Sidebar-brand">
      <img src={logo} className="Sidebar-brand-logo" alt="logo" />
      <span className="Sidebar-brand-title">Navi</span>
    </Nav.Link>

    <nav className="Sidebar-nav">
      <section>
        <NavLink href="/" className="Sidebar-nav-heading">Navi</NavLink>
        <NavLink href="/why-another-router">Why another router?</NavLink>
        <NavLink href="/why-another-static-site-generator">Why another static generator?</NavLink>
      </section>

      <section>
        <NavLink href="/tutorial/" className="Sidebar-nav-heading">Tutorial</NavLink>
        <HashLink href="/tutorial/#Creating-a-react-app">Creating a React app</HashLink>
        <HashLink href="/tutorial/#Templates">Templates</HashLink>
        <HashLink href="/tutorial/#The-JunctionNavigation-Component">The JunctionNavigation component</HashLink>
        <HashLink href="/tutorial/#Junctions-and-Pages">Junctions and Pages</HashLink>
        <HashLink href="/tutorial/#Rendering-Content">Rendering content</HashLink>
        <HashLink href="/tutorial/#Links">Links</HashLink>
        <HashLink href="/tutorial/#Markdown-Components">Markdown components</HashLink>
        <HashLink href="/tutorial/#Split-Content">Split content</HashLink>
        <HashLink href="/tutorial/#Static-Builds">Static builds</HashLink>
      </section>
      
      <section>
        <div className="Sidebar-nav-heading">Guides</div>
        <NavLink href="/static-sites-with-create-react-app/">Static builds with create-react-app</NavLink>
      </section>

      <section className="Sidebar-api">
        <NavLink href="/api-reference/" className="Sidebar-nav-heading">API Reference</NavLink>
        
        <div className="Sidebar-nav-subheading">Templates</div>

        <HashLink href="/api-reference/#createPageTemplate">createPageTemplate</HashLink>
        <HashLink href="/api-reference/#createRedirectTemplate">createRedirectTemplate</HashLink>
        <HashLink href="/api-reference/#createJunctionTemplate">createJunctionTemplate</HashLink>

        <div className="Sidebar-nav-subheading">Components</div>

        {/*<ComponentLink
          href="/api-reference/#ExitPrompt"
          name='ExitPrompt'
          props={[
            ['message-string', 'message: string'],
            ['message-func', 'message: func'],
            ['when', 'when?: bool'],
          ]}
        />*/}

        {<ComponentLink
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
          href="/api-reference/#Link"
          name='Link'
          props={[
            ['active', 'active?: bool'],
            ['activeClassName', 'activeClassName?: string'],
            ['activeStyle', 'activeStyle?: object'],
            ['exact', 'exact?: string'],
            ['href', 'href: string'],
          ]}
        />

        <div className="Sidebar-nav-subheading">Types</div>

        <HashLink href="/api-reference/#Junction">Junction</HashLink>
        <HashLink href="/api-reference/#Page">Page</HashLink>
      </section>

      <section>
        <NavLink href="https://github.com/frontarm/navi" className="Sidebar-nav-heading">GitHub &raquo;</NavLink>
      </section>
    </nav>
  </div>


const NavLink = ({ children, className='', href }) =>
  <Nav.Link
    activeClassName='Sidebar-NavLink-active'
    className={'Sidebar-NavLink '+className}
    href={href}
    exact>
    {children}
  </Nav.Link>

const HashLink = ({ children, className='', href }) =>
  <Nav.Link
    className={'Sidebar-HashLink '+className}
    href={href}
    exact>
    {children}
  </Nav.Link>

const ComponentLink = ({ href, name, props }) =>
  <div className='Sidebar-ComponentLink'>
    <HashLink href={href}>&lt;{name}&gt;</HashLink>
    {/*props.map(([id, label]) => 
      <HashLink
        key={id}
        href={href+'-'+id}
        className="Sidebar-nav-prop">
        {label}
      </HashLink>    
    )*/}
  </div>