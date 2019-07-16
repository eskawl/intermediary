const Intermediary =  require('../lib/intermediary');

const say = (msg) => {
    console.log(msg);
}

const addCount = Intermediary.createMiddleware((ctx, msg) => {
    ctx.repeatCount = ctx.repeatCount + 1;
    return msg;
});

const repeater = Intermediary.createMiddleware((ctx, msg) => {
    let repeatedMsg = (`${msg}!`).repeat(ctx.repeatCount);
    return repeatedMsg;
})

const shouter = Intermediary.createMiddleware((ctx, msg)=>{
    let upper = msg.toUpperCase();
    return upper;
})

const intermediary1 = new Intermediary([addCount]);
const intermediary2 = new Intermediary([repeater, shouter]);

shout = Intermediary.series([intermediary1, intermediary2], say, {repeatCount: 3})


shout('abcd');