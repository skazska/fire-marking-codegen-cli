const fs = require('fs');
'use strict';

class batchStorage {
   storageReady (storage) {
      return Promise.reject(new Error('Abstract method invocation!'));
   }

   notFixed (key) {
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

class batchFileStorage extends batchStorage {
   constructor (path) {
      super();
      this._dataPath = path;
      this.promise = this.storageReady(this._dataPath).then(() => { return this; });
   }

   storageReady (storage) {
      return new Promise(
         (resolve, reject) => (!fs.existsSync(storage)) ? fsMkDir(storage, resolve, reject) : resolve(true)
      );
   }

   notFixed (key) {
      return new Promise( (resolve, reject) => {
         fs.exists(key, (err) => {
            if (err) return reject(err);
            resolve(true);
         })
      })
   }

   isCreatable (batchId) {
      let dataPath = this._dataPath + '/' + batchId;
      let conditions = [
         this.storageReady(dataPath),
         this.notFixed(dataPath + '/batchRecord.json')
      ];
      return Promise.all(conditions);
   }
}

module.exports = {
   batchFileStorage: batchFileStorage,
};