const codes = require('@skazska/marking-codes');
const dsa = require('@skazska/nano-dsa');
const dsaTest = require('./dsaTest');

/**
 * Version 0 marking codes generator
 * Version 0 marking codes assumes per batch dsa params generation as well as pri and pub keys
 * Version 0 marking codes assumes 4 base36 digits for sign (so up to 1295 for r and s each)
 */

/**
 * Creates code batch record
 * @param {number} producerId
 * @param {string} producerName
 * @param {number} id
 * @param {string} description
 * @param {number} [codeVersion]
 * @returns {{id: number, dsa: {q: number, p: number, g: number}, version: number, producerId: number, publicKey: number, privateKey: number}}
 */
function createBatch(producerId, producerName, id, description, codeVersion) {
    let dsaParams = {};
    let keys = {};
    let testResult = false;
    let trial = 0;

    //generate dsa params & keys
    console.log('generating DSA params for batch...');
    do {
        do {
            //generate dsa codes for batch
            do {
                dsaParams = dsa.generateParams(1500, 30000);
            } while (dsaParams.q < 300 || dsaParams.q > 1295 || dsaParams.p < 300 || dsaParams.q > 7000000 || dsaParams.g < 30 || dsaParams.g > 7000000);

            keys = dsa.generateKeys(dsaParams);
        } while (keys.pri < 300 || keys.pri > 1295 || keys.pub < 5000);
        testResult = dsaTest.quickTest(dsaParams, keys, ++trial);
    } while (!testResult);
    console.log('all done!');

    //create batch full record
    const result = {
        producerId: producerId,
        producerName: producerName,
        id: id,
        description: description,
        version: codeVersion,
        dsa: dsaParams,
        publicKey: keys.pub,
        privateKey: keys.pri
    };

    console.log('code batch record: ', result);

    return result;
}


/**
 * creates markup code from id for batch
 * @param {{id: number, dsa: {q: number, p: number, g: number}, version: number, producerId: number, publicKey: number, privateKey: number}} batch
 * @param {number} id
 */
function createBatchMarkCode(batch, id) {
    return codes.encode(batch, id, batch.version);
}

/**
 * generates range of codes for batch from ids in range [from, to] (inclusive)
 * @param batch
 * @param from
 * @param to
 * @return {Array}
 */
function generateRange(batch, from, to) {
    const result = [];
    for (let i = from; i < to + 1; i++) {
        let code = createBatchMarkCode(batch, i);
        let decode = codes.decode(code, batch);
        result.push({
           code: createBatchMarkCode(batch, i),
           decoded: decode
        });
    }
    return result;
}


module.exports = {
    createBatch: createBatch,
    generateRange: generateRange,
    createBatchMarkCode: createBatchMarkCode
};