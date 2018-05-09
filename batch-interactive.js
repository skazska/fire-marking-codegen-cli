const { prompt } = require('inquirer');
'use strict';

const validateInteger = (val) => {
    return /^[0-9]+$/.test(val);
};

const toInteger = (val) => {
    return parseInt(val);
};

const validateIsDefined = (val) => {
    return typeof val !== 'undefined' && val !== null && !Number.isNaN(val);
};

const setDefaults = (prompts, answers) => {
    return prompts.map(q => {
        if (validateIsDefined(answers[q.name])) q.default = answers[q.name];
        return q;
    })
};

const createBatchPrompts = [
    {
        type : 'input',
        name : 'producerId',
        message : 'Enter producer id (number)...',
        validate: validateInteger,
        filter: toInteger
    },
    {
        type : 'input',
        name : 'producerName',
        message : 'Enter producer name ...'
    },
    {
        type : 'input',
        name : 'id',
        message : 'Enter batch id (number)...',
        validate: validateInteger,
        filter: toInteger
    },
    {
        type : 'input',
        name : 'description',
        message : 'Enter batch description ...'
    },
    {
        type : 'input',
        choices: [{name: 'version 0', value: 0}],
        name : 'version',
        default: 0,
        message : 'Enter batch version (number)...',
        validate: validateInteger,
        filter: toInteger
    }
];

function createBatchPrompt(batchRecord) {
    if (validateIsDefined(batchRecord.producerId) && validateIsDefined(batchRecord.id) ) {
        return Promise.resolve(batchRecord);
    } else {
        return new Promise((resolve, reject) => {
            prompt(setDefaults(createBatchPrompts, batchRecord)).then( answers => {
                resolve(answers);
            });
        });
    }
}

const generateCodesPrompts = [
    {
        type : 'input',
        name : 'id',
        message : 'Enter batch id (number)...',
        validate: validateInteger,
        filter: toInteger
    },
    {
        type : 'input',
        name : 'from',
        message : 'Enter id from (inclusive, number) ...',
        validate: validateInteger,
        filter: toInteger
    },
    {
        type : 'input',
        name : 'to',
        message : 'Enter id to (inclusive, number) ...',
        validate: validateInteger,
        filter: toInteger
    }
];

function generateCodesPrompt(params) {
    if (validateIsDefined(params.id) && validateIsDefined(params.from) && validateIsDefined(params.to)) {
        return Promise.resolve(params);
    } else {
        return new Promise((resolve, reject) => {
            prompt(setDefaults(generateCodesPrompts, params)).then( answers => {
                resolve(answers);
            });
        });
    }
}


module.exports = {
    createBatchPrompt: createBatchPrompt,
    generateCodesPrompt: generateCodesPrompt
};