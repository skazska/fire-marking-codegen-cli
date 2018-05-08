const { prompt } = require('inquirer');
'use strict';

const createBatchPrompts = [
    {
        type : 'input',
        name : 'producerId',
        message : 'Enter producerId ...'
    },
    {
        type : 'input',
        name : 'lastname',
        message : 'Enter lastname ...'
    },
    {
        type : 'input',
        name : 'phone',
        message : 'Enter phone number ...'
    },
    {
        type : 'input',
        name : 'email',
        message : 'Enter email address ...'
    }
];

function createBatchPrompt(batchRecord) {



}

function promptConfirmation(question, callback) {
    prompt([{ type: 'confirm', name: 'ans', message: question }]).then(answers => callback(null, answers['ans']));
}

module.exports = {
    promptConfirmation: promptConfirmation,
    createBatchPrompt: createBatchPrompt
};