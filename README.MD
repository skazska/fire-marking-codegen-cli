Should work fine with node.js 8 and higher

Before use, run  `npm install`

Usage help: `node index.js --help`

This cli allows:

* create code batch record (and store it in `data/[batchId]` folder)
* using that code batch record - generate codes in range (and store them in `data/[batchId]` folder)

Examples:

``` 
 node index.js createBatch 0 "Zero ltd" 0 "first batch" 0
 node index.js generateCodes 0 0 1000
``` 

(currently each code batch record and it's codes get stored in `data/<batchId>` folder 