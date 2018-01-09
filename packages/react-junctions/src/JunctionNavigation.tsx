import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { History, createBrowserHistory } from 'history'
import { BrowserNavigation, JunctionRoute, JunctionTemplate, Location } from 'junctions'
import { NavigationProvider } from './NavigationProvider'


let renderToString: any
try {
  // This hack prevents webpack from bundling react-dom/server, but still
  // allows it to be loaded when executed within junctions-static's
  // jsdom environment.
  renderToString = eval('require')('react-dom/server').renderToString
}
catch(e) {}


const defaultRender = (
  route: JunctionRoute,
  navigation: BrowserNavigation<any>,
  location: Location
) =>
  React.createElement(route[0].component, {
    junction: route[0],
    env: {
      navigation,
      location
    },
  })


export interface JunctionNavigationProps {
  /**
   * The JunctionTemplate object that will be used to produce the root
   * junction.
   */
  root: JunctionTemplate,

  /**
   * You may want to render a JunctionWrapper here. You'll probbly also want
   * to add `location` and `navigation` to an `env` prop (but if adding
   * location to `env` here slows your app down too much, it is not required,
   * but it does mean that PureComponents may not be re-rendered on route
   * changes)
   */
  render?: (
    route: JunctionRoute | undefined,
    navigation: BrowserNavigation<any>,
    location: Location,
  ) => React.ReactElement<any>,

  /**
   * Optional - if not specified, a BrowserHistory will be created.
   */
  history?: History,

  /**
   * Useful on statically rendered sites, so the initially received HTML
   * can be displayed until the content is ready to be rendered.
   * If you don't pass `id` with `waitForInitialContent`, a tentative id will
   * be genrated and a warning will be emitted.
   */
  waitForInitialContent?: boolean

  /**
   * Whether to follow any redirects in the current route.
   * 
   * Defaults to `true`.
   */
  followRedirects?: boolean,

  /**
   * Adds a title announcer div for accessibility, and
   * announce the title as the user navigates.
   * 
   * You can also supply a function that reseives `pageTitlepageTitle`, and
   * returns a processed string that will be announced.
   * 
   * Defaults to `true`.
   */
  announceTitle?: boolean | ((pageTitle: string | null) => string),

  /**
   * Sets `document.title` to the value of the
   * `pageTitle` property in the current junctions' meta, if it exists.
   * 
   * You can also supply a function that reseives `pageTitle`, and
   * returns a processed string that will be set.
   * 
   * Defaults to `true`.
   */
  setDocumentTitle?: boolean | ((pageTitle: string | null) => string),

  /**
   * Adds a `navigation` object to child components' context.
   * 
   * Defaults to `true`, but I recommend setting to `false` if possible.
   */
  addToContext?: boolean,

  // Standard DOM properties that will be added to the wrapper div.
  id?: string
  className?: string,
  style?: object,
}


let navigationIdCounter = 1


export class JunctionNavigation<
  RootJunctionTemplate extends JunctionTemplate = JunctionTemplate
> extends React.Component<JunctionNavigationProps, any> {

  navigation: BrowserNavigation<RootJunctionTemplate>
  serverRenderedHTML: string
  containerNode: any
  shouldHydrate?: boolean
  addToContext?: boolean
  renderCompleteCallback?: () => {}

  constructor(props: JunctionNavigationProps) {
    super(props)

    let {
      root,
      history,
      followRedirects,
      announceTitle,
      setDocumentTitle,
      waitForInitialContent,
      addToContext = true,
      id,
    } = props

    this.addToContext = addToContext

    this.navigation = new BrowserNavigation({
      rootJunctionTemplate: root,
      history,
      followRedirects,
      announceTitle,
      setDocumentTitle,
    })

    this.navigation.subscribe(this.handleRouteChange, {
      waitForInitialContent
    })

    if (!waitForInitialContent || !this.navigation.isBusy()) {
      this.state = {
        route: this.navigation.getRoute()
      }
    }
    else {
      if (!id) {
        id = '_JUNCTIONS_REACT_NAVIGATION_'+(navigationIdCounter++)
        console.warn(
          `The <Navigation> component requires an "id" prop when the ` +
          `"waitForInitialContent" flag is set. Falling back to an ` +
          `automatically generated id ("${id}").`
        )
      }

      try {
        this.serverRenderedHTML = (document as any).getElementById(id).innerHTML
        this.shouldHydrate = true
      }
      catch (e) {
        this.serverRenderedHTML = ''
      }
      this.state = {
        waitingForInitialContent: true,
      }
    }
  }

  render() {
    // If we're rendering this server side, we need to actually render the
    // content. Otherwise, we'll use whatever content the server rendered
    // (if any).
    let string =
      renderToString
          ? renderToString(this.getElementToRender())
          : this.serverRenderedHTML

    return (
      <div
        ref={this.setContainer}
        className={this.props.className}
        style={this.props.style}
        id={this.props.id}

        // Because this element's props never changes, React will never
        // re-render this string to the DOM, even if the corresponding DOM
        // node's children do change.
        dangerouslySetInnerHTML={{ __html: string }}
      />
    )
  }

  componentDidMount() {
    this.renderChildren()
  }

  componentDidUpdate() {
    this.renderChildren()
  }

  getElementToRender() {
    let render = this.props.render || defaultRender
    let content = render(
      this.state.route,
      this.navigation,
      this.navigation.getLocation()
    )
    if (this.addToContext) {
      return (
        <NavigationProvider navigation={this.navigation}>
          {content}
        </NavigationProvider>
      )
    }
    else {
      return content
    }
  }

  renderChildren() {
    if (!this.state.waitingForInitialContent) {
      let renderer = this.shouldHydrate ? ReactDOM.hydrate : ReactDOM.render
      renderer(
        this.getElementToRender(),
        this.containerNode,
        this.handleRenderComplete
      )
    }
  }

  // We need to let the `BrowserNavigation` instance know when rnedering has
  // complete, as we need to wait to scroll to any #hash.
  handleRenderComplete = () => {
    if (this.renderCompleteCallback) {
      this.renderCompleteCallback()
      delete this.renderCompleteCallback
    }
  }

  setContainer = (node) => {
    this.containerNode = node
  }

  handleRouteChange = (done: () => {}) => {
    this.renderCompleteCallback = done
    this.setState({
      route: this.navigation.getRoute(),
      waitingForInitialContent: false,
    })
  }
}
