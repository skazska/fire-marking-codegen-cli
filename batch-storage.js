const fs = require('fs');
'use strict';

class batchStorage {
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
   constructor () {
      super();
      this.dataPath = process.cwd() + '/data';
      this.promise = this.storageReady(this.dataPath);
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
      let dataPath = this.dataPath + '/' + batchId;
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