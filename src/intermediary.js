class Intermediary {
    constructor(middleware, afterware) {
        this.middleware = middleware;
        this.afterware = afterware;
    }

    involve(target, context = {}) {
        return async (...targetArgs) => {
            let finalTargetArgs = [];
            let next = (...targetArgs) => {
                finalTargetArgs = targetArgs;
                return target(...targetArgs);
            };
            if(this.middleware){
                let middleware = this.middleware.reverse();
                for (const currentMiddleware of middleware) {
                    next = await currentMiddleware(context)(next)
                }
            }
            let result = await next(...targetArgs);

            if(this.afterware){
                let afterware = this.afterware.reverse();
                next = (result) => result;
                for (const currentAfterware of afterware) {
                    next = await currentAfterware(context)(next)
                }
                return next(result, ...finalTargetArgs);
            } else {
                return result;
            }

        }
    }
}

export function createMiddleware(fn) {
    return (ctx) => (next) => fn
}

export default Intermediary;

