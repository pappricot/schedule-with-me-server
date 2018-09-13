const {DATABASE_URL} = require('./config');
const Agenda = require("agenda");

const agenda = new Agenda({db: {address: DATABASE_URL}});

async function runAgenda() {
    await agenda.start();
    //await agenda.schedule('in 10 seconds', 'print message', {message: "works after 10 seconds"})
}

agenda.define('print message', (job, done) => {
    console.log("Agenda works!");
    done()
})

agenda.define('notify event start', (job, done) => {
    console.log("notify event works!");
    console.log('long thing', job.attrs.data)
    done()
})
module.exports = {
    agenda,
    runAgenda
};
