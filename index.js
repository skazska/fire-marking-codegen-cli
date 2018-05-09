#!/usr/bin/env node
'use strict';

const program = require('commander');
// Require logic.js file and extract controller functions using JS destructuring assignment
const { createBatchPrompt, generateCodesPrompt } = require('./batch-interactive');
const BatchFileStorage = require('./batch-storage');
const BatchController = require('./batch-controller');

const batchStorage = new BatchFileStorage(process.cwd() + '/data');
const batchController = new BatchController(batchStorage);

const appReady = Promise.all(
   [
      batchStorage.promise,
      batchController.promise
   ]
);

program
    .version('0.0.2')
    .description('Marking code batch management');

program
    .command('createBatch [producerId] [producerName] [batchId] [batchDescr] [markingVersion]')
    .alias('cb')
    .description('Create code batch, [prodicerId] - (number), [producerName] - (string), [batchId] - (number), ' +
       '[batchDescr] - (string) [markingVersion] - (number) currently - 0 only supported')
    .action((producerId, producerName, batchId, batchDescr, markingVersion) => {
        let batch = {
            producerId: parseInt(producerId),
            producerName: producerName,
            id: parseInt(batchId),
            descr: batchDescr,
            version: parseInt(markingVersion)
        };

        Promise.all([
            appReady,
            createBatchPrompt(batch)
        ]).then( ([ [batchStorage, batchController], batchRecord ]) => {
            batchStorage.isCreatable(batchRecord)
                .then( ok => {
                    return batchController.createBatch(batchRecord);
                })
                .then( batch => { return batchStorage.save(batch); })
                .then( path => { console.log('saved to ', path) })
                .catch( err => { console.error(err); });
        });
    });

program
    .command('generateCodes [batchId] [idFrom] [idTo]')
    .alias('g')
    .description('Generate Codes in range [idFrom] (number) [idTo] (number) for batch identified by [batchId] (number) ' +
       'batch record should already be created by *createBatch* command and stored in data folder')
    .action((batchId, idFrom, idTo) => {
        let params = {
            id: parseInt(batchId),
            from: parseInt(idFrom),
            to: parseInt(idTo)
        };

        Promise.all([
            appReady,
            generateCodesPrompt(params)
        ]).then( ([ [batchStorage, batchController], params ]) => {
            batchStorage.read(params.id)
                .then( batch => {
                    return batchStorage.doesRangeIntersect(params)
                        .then( does => {
                            if (!does) {
                                return batch;
                            } else {
                                return Promise.reject(new Error('Range '+ params.from + ' - ' + params.to + ' exists!'));
                            }
                        })
                        .catch( err => Promise.reject(err));
                })
                .then( batch => {
                    return {
                        codes: batchController.generateRange(batch, params.from, params.to),
                        batch: batch
                    }
                })
                .then( ({codes, batch}) => {
                    batchController.exportToFile(
                        process.cwd() + '/data/' + batch.id + '/codes_' + params.from + '_' + params.to + '.csv',
                        codes
                    );
                    return batchStorage.saveCodes(batch.id, codes, params.from, params.to);
                })
                .then( path => { console.log('saved to ', path) })
                .catch( err => { console.error(err); });
        });
    });

program.parse(process.argv);