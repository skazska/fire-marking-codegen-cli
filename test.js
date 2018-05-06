const {createBatch, generateRange} = require('./batch-controller');

const batch = createBatch(0, 'test', 0, 'testBatch', 0);
console.log(generateRange(batch, 0, 10));
batch.version = 7;
console.log(generateRange(batch, 0, 10));
batch.version = 15;
console.log(generateRange(batch, 0, 10));
