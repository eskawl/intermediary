class MiddleStack {
    constructor(middleware, afterware) {
        this.middleware = middleware;
        this.afterware = afterware;
    }

    applyMiddleware(target, context = {}) {
        return async (...targetArgs) => {
            let finalTargetArgs = [];
            let next = (...targetArgs) => {
                finalTargetArgs = targetArgs;
                return target(...targetArgs);
            };
            let middleware = this.middleware.reverse();
            for (const currentMiddleware of middleware) {
                next = await currentMiddleware(context)(next)
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

export default MiddleStack;


// (async () => {
		
		
//     function final(a, b, c) {
//         console.log(`Executing target function with ${a}, ${b}, ${c}`);
//         return ':D';
//     }

//     function delay(delay = 2000) {
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 resolve();
//             }, delay);
//         })
//     }
    
    
//     let middleware = [
//         (ctx) => (next) => async (a, b, c) => {
//             ctx.first = 1;
//             console.log("Waiting for async task")
//             await delay();
//             console.log(`Executing first middleware`);
//             console.log(ctx);
//             return next(a, b, c + 1)
//         },
//         (ctx) => (next) => (a, b, c) => {
//             ctx.second = 2;
//             console.log(`Executing second middleware`);
//             console.log(ctx);
//             return next(a, b, c)
//         }
//     ]
    
//     let afterware = [
//         (ctx) => (next) => (result, ...targetArgs) => {
//             console.log(`Executing first afterware`);
//             console.log(`Context was `);
//             console.log(ctx);
//             console.log(`Result was ${result}`);
//             console.log(`Target arguments were ${targetArgs}`);
//             return next(result, ...targetArgs);
//         },
//         (ctx) => (next) => async (result, ...targetArgs) => {
//             console.log(`Awaiting async task in afterware`);
//             await delay();
//             console.log(`Executing second afterware`);
//             return next(result, ...targetArgs);
//         },
//     ]

//     const stack = new MiddleStack(middleware, afterware);
//     await stack.applyMiddleware(final)(1, 2, 3);
//     console.log('Done');
// })()
