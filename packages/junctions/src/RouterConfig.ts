import { Location } from './Location'
import { MountedPattern, createRootMountedPattern } from './Patterns'
import { JunctionTemplate } from './JunctionTemplate';

/**
 * Allows you to be notified when junctions or content at a certain
 * path start and finish loading.
 * 
 * This can be used to analyze which bundle chunks are required
 * for each URL, and for each junction, so that <script> tags can be added
 * to statically generated HTML, and appropriate files can be 
 * pre-emptively pushed when HTTP/2 is available.
 */
export interface RouterEvent {
    type: 'contentStart' | 'contentEnd' | 'junctionStart' | 'junctionEnd',
    location: Location
}

export interface RouterConfig<RootJunctionTemplate extends JunctionTemplate = JunctionTemplate> {
    rootJunctionTemplate: RootJunctionTemplate;
    rootMountedPattern: MountedPattern;
    onEvent: (event: RouterEvent) => void,
}

export function createRouterConfig<RootJunctionTemplate extends JunctionTemplate = JunctionTemplate>(options: {
    junctionTemplate: RootJunctionTemplate,
    rootPath?: string,
    onEvent?: (event: RouterEvent) => void, 
}): RouterConfig<RootJunctionTemplate> {
    return {
        rootJunctionTemplate: options.junctionTemplate,
        rootMountedPattern: createRootMountedPattern(options.junctionTemplate, options.rootPath),
        onEvent: options.onEvent || (() => {})
    }
}
