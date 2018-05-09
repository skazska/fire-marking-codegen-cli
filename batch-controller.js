const codes = require('@skazska/marking-codes');
const fs = require('fs');

/**
 * Version 0 marking codes generator
 * Version 0 marking codes assumes per batch dsa params generation as well as pri and pub keys
 * Version 0 marking codes assumes 4 base36 digits for sign (so up to 1295 for r and s each)
 */

class BatchController {
   constructor (storage) {
      this.promise = this.controllerReady(storage).then(smth => { return this; });
   }

   controllerReady (storage) {
      return storage.promise.then(instance => {
          this._storage = instance;
      });
   }

    /**
     * creates batch record
     * @param {{id: number, version: number, producerId: number}} batchData
     * @return {{id: number, dsa: {q: number, p: number, g: number}, version: number, producerId: number, publicKey: number, privateKey: number}}
     */
   createBatch (batchData) {
       const result =  codes.prepareBatch(batchData);
       //create batch full record
       result.producerName = batchData.producerName;
       result.description = batchData.description;
       return result;
   }

    /**
     * creates markup code from id for batch
     * @param {{id: number, dsa: {q: number, p: number, g: number}, version: number, producerId: number, publicKey: number, privateKey: number}} batch
     * @param {number} id
     */
    createBatchMarkCode (batch, id) {
        return codes.encode(batch, id, batch.version);
    }

    /**
     * generates range of codes for batch from ids in range [from, to] (inclusive)
     * @param batch
     * @param from
     * @param to
     * @return {Array}
     */
    generateRange (batch, from, to) {
        const result = [];
        for (let i = from; i < to + 1; i++) {
            let code;
            let decode;
            do {
                code = this.createBatchMarkCode(batch, i);
                decode = codes.decode(code, batch);
            } while ( !decode.signOk );
            result.push({
                code: code,
                decoded: decode
            });
        }
        return result;
    }

    exportToFile(csvDataPath, codes) {
        const getCsvLine = (code, dCode, pCode, vCode) => {
            return code + ';' + dCode + ';' + pCode + ';' + vCode + ';' + '\n';
        };

        fs.writeFileSync(csvDataPath, getCsvLine('code', 'dCode', 'pCode', 'vCode'));

        codes.forEach((code, i) => {
            let dCode = '"https://d.rks.plus/' + code.code + '"';
            let pCode = '"https://p.rks.plus/' + code.code + '"';
            let vCode = '"' + code.decoded.descriptor + '-' + code.decoded.producerIdCode + '-'
                + code.decoded.batchIdCode + '-' + code.decoded.idCode + '-' + code.decoded.sign + '"';

            fs.appendFileSync(csvDataPath, getCsvLine('"'+code.code+'"', dCode, pCode, vCode));
            if (i % 100 === 0) console.log('Saved ' + i + ' codes');
            if (i === codes.length - 1) console.log('Saved ' + i + ' codes to ' + csvDataPath + ' Done!');
        });
    }
}

module.exports = BatchController;