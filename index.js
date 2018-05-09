#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
// Require logic.js file and extract controller functions using JS destructuring assignment
const { createBatch, generateRange } = require('./batch-controller');
const { createBatchPrompt } = require('./batch-interactive');

const checkInt = (val) => {
    return /^[0-9]+$/.test(val);
};

const prepareFolders = (batchId) => {
    let dataPath = process.cwd() + '/data';
    if (!fs.existsSync(dataPath)) {
        console.log('no data folder', dataPath, ' creating');
        fs.mkdirSync(dataPath);
    }
    dataPath += '/'+batchId;
    if (!fs.existsSync(dataPath)) {
        console.log('creating batch data folder', dataPath);
        fs.mkdirSync(dataPath);
    }
    return dataPath;
};

program
    .version('0.0.1')
    .description('Marking code batch management');

program
    .command('createBatch <producerId> <producerName> <batchId> <batchDescr> <markingVersion>')
    .alias('cb')
    .description('Create code batch, <prodicerId> - (number), <producerName> - (string), <batchId> - (number), ' +
       '<batchDescr> - (string) <markingVersion> - (number) currently - 0 only supported')
    .action((producerId, producerName, batchId, batchDescr, markingVersion) => {
        if (checkInt(producerId)) {
            producerId = parseInt(producerId);
        } else {
            console.log('producerId expected to be a number, provided value is ', producerId);
        }
        if (checkInt(batchId)) {
            batchId = parseInt(batchId);
        } else {
            console.log('batchId expected to be a number, provided value is ', batchId);
        }
        if (checkInt(markingVersion)) {
            markingVersion = parseInt(markingVersion);
        } else {
            console.log('markingVersion expected to be a number, provided value is ', markingVersion);
        }
        
        let dataPath = prepareFolders(batchId);
        dataPath += '/batchRecord.json';
        if (fs.existsSync(dataPath)) {
            console.log('batch record file ' + dataPath + ' exists!!! abort...');
            return 0;
        }
        const batchRecord = createBatch(producerId, producerName, batchId, batchDescr, markingVersion);
        fs.appendFile(dataPath, JSON.stringify(batchRecord), function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    });

program
    .command('generateCodes <batchId> <idFrom> <idTo>')
    .alias('g')
    .description('Generate Codes in range <idFrom> (number) <idTo> (number) for batch identified by <batchId> (number) ' +
       'barch record should already be created by *createBatch* command and stored in data folder')
    .action((batchId, idFrom, idTo) => {
        if (checkInt(batchId)) {
            batchId = parseInt(batchId);
        } else {
            console.log('batchId expected to be a number, provided value is ', batchId);
        }
        if (checkInt(idFrom)) {
            idFrom = parseInt(idFrom);
        } else {
            console.log('idFrom expected to be a number, provided value is ', idFrom);
        }
        if (checkInt(idTo)) {
            idTo = parseInt(idTo);
        } else {
            console.log('idTo expected to be a number, provided value is ', idTo);
        }

        let dataPath = prepareFolders(batchId);
        let batchRecordPath = dataPath + '/batchRecord.json';
        let csvDataPath = dataPath + '/codes_' + idFrom + '_' + idTo + '.csv';
        let jsonDataPath = dataPath + '/codes_' + idFrom + '_' + idTo + '.json';
        if (fs.existsSync(csvDataPath)) {
            console.log('batch record file ' + csvDataPath + ' exists!!! abort...');
            return 0;
        }
        if (fs.existsSync(jsonDataPath)) {
           console.log('batch record file ' + jsonDataPath + ' exists!!! abort...');
           return 0;
        }
        fs.readFile(batchRecordPath, function(err, data) {
            if (err) {
                console.log('batch record file read error!', err);
                return;
            }
            data = JSON.parse(data);
            console.log('batch record: ', data);

            const codes = generateRange(data, idFrom, idTo);

            const getCsvLine = (code, dCode, pCode, vCode) => {
                return code + ';' + dCode + ';' + pCode + ';' + vCode + ';' + '\n';
            };
            
            fs.appendFileSync(csvDataPath, getCsvLine('code', 'dCode', 'pCode', 'vCode'));
            
            codes.forEach((code, i) => {
                let dCode = '"https://d.rks.plus/' + code.code + '"';
                let pCode = '"https://p.rks.plus/' + code.code + '"';
                let vCode = '"' + code.decoded.descriptor + '-' + code.decoded.producerIdCode + '-'
                    + code.decoded.batchIdCode + '-' + code.decoded.idCode + '-' + code.decoded.sign + '"';

                fs.appendFileSync(csvDataPath, getCsvLine('"'+code.code+'"', dCode, pCode, vCode));
                if (i % 100 === 0) console.log('Saved ' + i + ' codes');
                if (i === codes.length - 1) console.log('Saved ' + i + ' codes Done!');
            });

           fs.appendFile(jsonDataPath, JSON.stringify(codes, null, '  '), function (err) {
              if (err) throw err;
           });
        });
    });

program.parse(process.argv);