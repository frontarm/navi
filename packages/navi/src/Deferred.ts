export class Deferred<T> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (error: any) => void;

    constructor() {
        this.promise = new Promise(function(resolve, reject) {
            this.resolve = resolve;
            this.reject = reject;
        }.bind(this));
        Object.freeze(this);
    }
}