import { Location } from './Location'
import { ContentHelpers } from './ContentHelpers'

export interface Navigation {
    getPages: ContentHelpers['getPages']
    getLocation(): Location;

    block(message: string): () => void;

    replaceLocation(location: Location);
    replaceLocation(path: string, state?: any);

    pushLocation(location: Location);
    pushLocation(path: string, state?: any);
}