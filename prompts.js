const { prompt } = require('inquirer');

const createBatchPrompts = [
    {
        type : 'input',
        name : 'firstname',
        message : 'Enter firstname ...'
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