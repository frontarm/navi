import { Location } from './Location'


// Internal format for storing locatinons as we parse them, which can be
// used to get a junction at a specific location, or to create a full
// State object.
export class MatchNode {
    // The full location of the node, including parent location
    location: Location

    // The key for the matched mount
    mountKey: string

    // Params matched to *this* node (but not its parents)
    params?: { [name: string]: any }

    // A child match, if one exists and it has been fetched.
    child?: MatchNode

    // Specify whether a child exists, and if so, whether we have access to it
    // yet. Note that the `notfound` value corresponds to a location that we
    // don't understand, while an `undefined` value corresponds to an empty
    // location.
    childStatus?: MatchNode.UnfetchedStatus | 'fetched'

    constructor(location: Location, mountKey: string, params: { [name: string]: any } | undefined, childOrStatus?: MatchNode | MatchNode.UnfetchedStatus) {
        this.location = location
        this.mountKey = mountKey
        this.params = params

        if (typeof childOrStatus === 'string') {
            this.childStatus = childOrStatus
        }
        else if (childOrStatus) {
            this.childStatus = 'fetched'
            this.child = childOrStatus
        }
    }

    setChild(childOrStatus: MatchNode | MatchNode.UnfetchedStatus): MatchNode {
        return new MatchNode(this.location, this.mountKey, this.params, childOrStatus)
    }
}

export namespace MatchNode {
    export type UnfetchedStatus = 'fetching' | 'fetchable' | 'error' | 'notfound'
}
