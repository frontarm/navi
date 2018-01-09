/**
 * This component is based on the `<Prompt>` component in react-router v4:
 * https://github.com/ReactTraining/react-router/blob/bb969201817b4ce1667d3933a69497777e1cad15/packages/react-router/modules/Prompt.js
 */

/*
MIT License

Copyright (c) 2016-present React Training

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import * as React from 'react'
import * as PropTypes from 'prop-types'
import { Navigation } from 'junctions'


export interface ExitPromptProps {
  env: {
    navigation: Navigation,
  },
  when?: boolean,
  message: string | (() => string)
}


/**
 * The public API for prompting the user before navigating away
 * from a screen with a component.
 */
export class ExitPrompt extends React.Component<ExitPromptProps> {
  navigation: Navigation;
  unblock?: () => void;

  static propTypes = {
    env: PropTypes.shape({
      navigation: PropTypes.shape({
        block: PropTypes.func.isRequired,
      })
    }),
    when: PropTypes.bool,
    message: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string
    ]).isRequired
  }

  static defaultProps = {
    when: true,
  }

  static contextTypes = {
    navigation: PropTypes.shape({
      block: PropTypes.func.isRequired
    }).isRequired
  }
  
  constructor(props, context) {
    super(props, context)

    this.navigation = this.props.env ? this.props.env.navigation : context.navigation

    if (process.env.NODE_ENV !== 'production') {
      if (!this.navigation) {
        console.warn(
          `An <ExitPrompt> was created without access to a "navigation" object. `+
          `You can provide a Navigation object through an "env" prop, or via `+
          `React Context.`
        )
      }
    }
  }

  enable(message) {
    if (this.unblock) {
      this.unblock()
    }

    this.unblock = this.navigation.block(message)
  }

  disable() {
    if (this.unblock) {
      this.unblock()
      delete this.unblock
    }
  }

  componentDidMount() {
    if (this.props.when) {
      this.enable(this.props.message)
    }
  }

  componentDidUpdate(nextProps) {
    if (nextProps.when) {
      if (!this.props.when || this.props.message !== nextProps.message) {
        this.enable(nextProps.message)
      }
    } else {
      this.disable()
    }
  }

  componentWillUnmount() {
    this.disable()
  }

  render() {
    return null
  }
}
