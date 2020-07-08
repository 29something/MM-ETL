const axios = require('axios');
let config = require('../../config/config');

function TxnSummaryComputeJob() {
}

TxnSummaryComputeJob.prototype = {
    constructor: TxnSummaryComputeJob,
    execute: function () {
        axios.post(config.etl.mmApi.url + '/users/0/transactions/summary',
            {}, {
                timeout: (1000*60*10),
                auth: {
                    username: config.etl.mmApi.username,
                    password: config.etl.mmApi.password
                }
            })
            .then(response=>{
                console.log("complete");
            })
            .catch(error=> {
                console.log("failed");
                console.log(error);
            })
    }

}

module.exports = function () {
    return new TxnSummaryComputeJob();
}