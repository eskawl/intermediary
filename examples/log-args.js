const {default: Intermediary} =  require('../lib/intermediary');

let middleware = [
    (ctx) => (next) => (...args) => {
        console.log(`Attempting to process with args: ${args.join(',')}`);
        return next(...args)
    }
]


let afterware = [
    (ctx) => (next) => (result, ...args) => {
        console.log(`Processed with args: ${args.join(', ')}. Result was ${result}`);
        return next(result, ...args)
    }
]

let final = () => {
    console.log('Processing.');
    return 'awesome!';
}

let intermediary = new Intermediary(middleware, afterware);
let involved = intermediary.involve(final);

if (require.main === module) {
    (async () => {
        await involved(1,2,3);
    })()
}

exports.intermediary = intermediary;
