const Intermediary =  require('../lib/intermediary');

const say = (msg) => {
    console.log(msg);
}

const addCount = Intermediary.createMiddleware((ctx, next, msg) => {
    ctx.repeatCount = ctx.repeatCount + 1;
    return next(msg);
});

const repeater = Intermediary.createMiddleware((ctx, next, msg) => {
    let repeatedMsg = (`${msg}!`).repeat(ctx.repeatCount);
    return next(repeatedMsg);
})

const shouter = Intermediary.createMiddleware((ctx, next, msg)=>{
    let upper = msg.toUpperCase();
    return next(upper);
})

const intermediary1 = new Intermediary([addCount]);
const intermediary2 = new Intermediary([repeater, shouter]);

shout = Intermediary.series([intermediary1, intermediary2], say, {repeatCount: 3})


shout('abcd');