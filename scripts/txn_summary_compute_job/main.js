let TxnSummaryComputeJob = require('./txn_summary_compute_job')
let moment = require('moment')

function execute() {
    let currentDate = moment().format("DD/MM/YYYY")
    let args = process.argv.slice(2)
    console.log("computing txn summary for :: "+currentDate);
    TxnSummaryComputeJob().execute();
}

execute();