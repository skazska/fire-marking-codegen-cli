const program = require('commander');
// Require logic.js file and extract controller functions using JS destructuring assignment
const { createBatch } = require('./batch-controller');

program
    .version('0.0.1')
    .description('Marking code batch management');

program
    .command('createBatch <producerId> <producerName> <batchId> <batchName> <markingVersion>')
    .alias('cb')
    .description('Create code batch')
    .action((producerId, producerName, batchId, batchName, markingVersion) => {
        createBatch(producerId, producerName, batchId, batchName, markingVersion);
    });

// program
//     .command('getContact <name>')
//     .alias('r')
//     .description('Get contact')
//     .action(name => getContact(name));

program.parse(process.argv);