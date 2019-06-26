class Intermediary {
    constructor(middleware, afterware) {
        this.middleware = middleware;
        this.afterware = afterware;
    }

    static series(intermediaries, target){
        return async (...targetArgs) => {
            let lastIntermediary = intermediaries.pop();
            let next = lastIntermediary.involve(target).bind(lastIntermediary);
            intermediaries.reverse();
            for (const intermediary of intermediaries) {
                if(!(intermediary instanceof Intermediary)){
                    throw new Error('intermediaries should be instances of Intermediary')
                } 
                next = intermediary.involve(next).bind(intermediary)
            };
            return next(...targetArgs)
        }
    }

    static createMiddleware(fn){
        return (ctx) => (next) => (...targetArgs) => fn(ctx, next, ...targetArgs)
    }

    static createAfterware(fn){
        return (ctx) => (next) => (result, ...targetArgs) => fn(ctx, next, result, ...targetArgs)
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

    

export default Intermediary;

