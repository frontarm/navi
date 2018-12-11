import React from 'react'
import { DemoboardProps } from './content/Demoboard';

/**
 * If this code block's content maps to a demoboard, then return an object
 * with the demoboard's props. Otherwise, return undefined.
 */
export function extractInlineDemoboardProps(source: string, highlightedSource: string, helpers: { [name: string]: string } = {}): DemoboardProps | undefined {
  // Inline demoboards must start with //---
  if (!/\/\/---\s/.test(source)) {
    return
  }

  let files = source.split(/(^|\n)\/\/---\s+/).slice(1)
  let sources: { [name: string]: string } = {}
  let demoboardProps: DemoboardProps = {
    sources,
  }
  for (let i = 0; i < files.length; i++) {
    let file = files[i]
    let fileFirstNewline = file.indexOf('\n')
    let fileConfig: string[]
    let fileContents: string
    if (fileFirstNewline === -1) {
      fileConfig = file.split(/\s+/)
      fileContents = ''
    }
    else {
      fileConfig = file.slice(0, fileFirstNewline).split(/\s+/)
      fileContents = file.slice(fileFirstNewline+1)
    }

    let [fileName, useHelper, helperName] = fileConfig

    // This breadboard has a config block
    if (i === 0 && !fileName) {
      Object.assign(demoboardProps, parseConfigBlock(fileContents))
      continue
    }

    if (!fileName) {
      console.warn(`An inline demoboard defined a file without a filename, with the following contents:`)
      console.warn(fileContents)
      continue
    }

    // Add a leading slash to the name component, while leaving alone any part
    // before the ':' (e.g. "solution:"")
    let fileNameMatch = fileName.match(/^(\w+:)?(.*)$/)!
    fileName = (fileNameMatch[1] || '')+addLeadingSlash(fileNameMatch[2])

    // Pull in the file's contents from a helper if one is specified
    if (useHelper === '<--') {
      helperName = addLeadingSlash(helperName)

      if (fileContents !== '') {
        console.warn(`An inline demoboard reference the helper "${helperName}", while also defining contents. Using the helper.`)
      }

      let helperContents = helpers[helperName]
      if (helperContents === undefined) {
        console.warn(`An inline demoboard referenced the helper "${helperName}", but it couldn't be found.`)
      }
      fileContents = helperContents
    }

    sources[fileName] = fileContents
  }

  return demoboardProps
}

const ConfigOptionNames = [
  'persistenceKey',
  'restricted',
  
  'theme',

  'maximizeLeftPanel',
  'maximizeRightPanel',
  'leftPanel',
  'lineCount',
  'rightPanel',
  'tab',
]

// split by chunk starting with \w+.
// for each chunk, try parsing its rhs with JSON.parse.
// If that fails, just use it as a string.
function parseConfigBlock(source: string): Partial<DemoboardProps> {
  let config: Partial<DemoboardProps> = {}
  let lines = source.split('\n')
  while (lines.length) {
    let line = lines.shift()!.trim()

    if (line === '') {
      continue
    }

    let match = line.match(/^(\w+):\s*(.*)$/)

    if (!match) {
      console.warn(`Unrecognized config line in inline demoboard: "${line}"`)
      continue
    }

    let [_, optionName, optionString] = match

    if (ConfigOptionNames.indexOf(optionName) === -1) {
      console.warn(`Unrecognized config name "${optionName}" in inline demoboard.`)
    }

    let optionValue
    try {
      optionValue = JSON.parse(optionString)
    }
    catch (e) {
      optionValue = optionString
    }
    config[optionName] = optionString
  }
  return config
}

function addLeadingSlash(str: string) {
  return str[0] === '/' ? str : '/'+str
}

// // Take a mixed collection of files, and split into documents and their
// // solutions by checking for files that start with 'solution:'
// function splitSourcesAndSolutions(files: { [name: string]: string }) {
//   let sources = {} as { [name: string]: string }
//   let solutions = {} as { [name: string]: string }
//   let filenames = Object.keys(files)
//   let hasSolutions = filenames.some(filename => /^\/solution:/.test(filename))
//   for (let name of filenames) {
//     if (/^\/solution:/.test(name)) {
//       solutions[name.replace(/^\/solution:/, '/')] = files[name]
//     }
//     else {
//       sources[name] = files[name]
//     }
//   }
//   if (hasSolutions) {
//     for (let name of filenames) {
//       if (!/^\/solution:/.test(name) && solutions[name] === undefined) {
//         solutions[name] = sources[name]
//       }
//     }
//   }
//   return {
//     sources,
//     solutions: hasSolutions ? solutions : null,
//   }
// }