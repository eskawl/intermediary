const { default: Intermediary } =  require('../lib/intermediary');
const { intermediary: timeIntermediary } = require('./log-time');
const { intermediary: argsIntermediary } = require('./log-args');
const { intermediary: asyncIntermediary } = require('./async');

let final = () => {
    console.log('Processing.');
    return 'awesome!';
}

(async () => {
    await Intermediary.series([argsIntermediary, asyncIntermediary, timeIntermediary], final, {delay: 5000})(1,2,3)
    // await argsIntermediary.involve(timeIntermediary.involve(final))(123)
})()