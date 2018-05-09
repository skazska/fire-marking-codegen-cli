const fs = require('fs');
'use strict';

class batchStorage {
    storageReady (storage) {
        return Promise.reject(new Error('Abstract method invocation!'));
    }

    isNotFixed (key) {
        return Promise.reject(new Error('Abstract method invocation!'));
    }

    isCreatable (batchId) {
        return Promise.reject(new Error('Abstract method invocation!'));
    }
}

const fsMkDir = (path, resolve, reject) => {
    fs.mkdir(path, null, err => {
        if (err) return reject(err);
        resolve(true);
    });
};

class BatchFileStorage extends batchStorage {
    constructor (path) {
        super();
        this._dataPath = path;
        this.promise = this.storageReady(this._dataPath).then(() => { return this; });
    }

    storageReady (storage) {
        return new Promise(
            (resolve, reject) => {
                (!fs.existsSync(storage)) ? fsMkDir(storage, resolve, reject) : resolve(true)
            }
        );
    }

    isFixed (key) {
        return new Promise( (resolve, reject) => {
            fs.access(key, fs.constants.F_OK, (err) => {
              if (err) return resolve(false);
              resolve(true);
           })
        })
    }

    isNotFixed (key) {
        return this.isFixed(key).then(is => !is);
    }

    /** checks if batch can be created, check if storage are ready and if there is no fixed batch exists
     * @param {{producerId: number, id: number, version: number}} batch
     * @return {Promise<boolean[]>}
     */
    isCreatable (batch) {
        let dataPath = this._dataPath + '/' + batch.id;
        let conditions = [
            this.storageReady(dataPath),
            this.isNotFixed(dataPath + '/batchRecord.json')
        ];
        return Promise.all(conditions).then(
            oks => oks.every(ok => ok) ? true : Promise.reject(new Error('batch ' + batch.id + ' exists!'))
        );
    }

    /**
     *
     * @param batchRecord
     */
    save (batchRecord) {
        let dataPath = this._dataPath + '/' + batchRecord.id + '/batchRecord.json';
        return new Promise( (resolve, reject) => {
            fs.appendFile(dataPath, JSON.stringify(batchRecord), function (err) {
                if (err) reject(err);
                resolve(dataPath);
            });
        });
    }

    _read (key) {
        return new Promise((resolve, reject) => {
            fs.readFile(key, null, function(err, data) {
                if (err) return reject(err);
                data = JSON.parse(data);
                resolve(data);
            });
        });
    }

    read (id) {
        let dataPath = this._dataPath + '/' + id + '/batchRecord.json';
        return this.isFixed(dataPath)
            .then( ok => {
                if (ok) {
                    return this._read(dataPath);
                } else {
                    return Promise.reject('Batch does not exist')
                }
            });
    }

    doesRangeIntersect ({id, from, to}) {
        let dataPath = this._dataPath + '/' + id;
        let csvDataPath = dataPath + '/codes_' + from + '_' + to + '.json';
        return new Promise((resolve, reject) => {
            fs.access(csvDataPath, fs.constants.F_OK, (err) => {
                if (err) return resolve(false);
                resolve(true);
            });
        });

    }

    saveCodes (id, codes, from, to) {
        let dataPath = this._dataPath + '/' + id;
        let jsonDataPath = dataPath + '/codes_' + from + '_' + to + '.json';
        return new Promise((resolve, reject) => {
            fs.appendFile(jsonDataPath, JSON.stringify(codes, null, '  '), function (err) {
                if (err) reject(err);
                resolve(jsonDataPath);
            });
        });
    }
}

module.exports = BatchFileStorage;