import { Location } from './Location'
import { RedirectRoute } from './Route'
import { Matcher, TemplateBase, AsyncTemplate, MatcherOptions } from './Template'


export interface RedirectTemplate<Meta=any> extends TemplateBase<RedirectMatcher<Meta>> {
    templateType: 'Redirect'

    new(options: MatcherOptions): RedirectMatcher<Meta>

    to: Location | ((location: Location) => Location),
    meta: Meta,

    // Explicitly specifying `never` allows us to use TypeScript mapped types
    // on the ['component'] property of a `Template`.
    component: never
}


export class RedirectMatcher<Meta=any> extends Matcher {
    static type: 'Template' = 'Template';
    static templateType: 'Redirect' = 'Redirect';

    ['constructor']: RedirectTemplate;

    getRoute(): RedirectRoute<RedirectTemplate<Meta>> | undefined {
        if (!this.match || (this.match.remainingLocation && this.match.remainingLocation.pathname !== '/')) {
            return
        }

        let to =
            typeof this.constructor.to === 'function'
                ? this.constructor.to(this.segmentLocation)
                : this.constructor.to

        return [this.createSegment('redirect', { to })]
    }
}


export function createRedirectTemplate<Meta=any>(
    to: Location | string | ((location: Location) => Location),
    meta?: Meta
): RedirectTemplate {
    let toLocation =
        typeof to === 'string'
            ? { pathname: to }
            : to

    return class extends RedirectMatcher {
        static to = toLocation
        static component = <never>undefined
        static params = []
        static meta = meta
    }
}
