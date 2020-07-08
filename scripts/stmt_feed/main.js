let StatementFeed = require('./stmt_feed')
let moment = require('moment')

function execute() {
    let fromDate = moment().subtract(1,'days').format("DD/MM/YYYY");
    let toDate = moment().format("DD/MM/YYYY")
    let args = process.argv.slice(2)
    let stmtType = args[0];
    let stmtStatus = args[1];
    console.log("updating order statement for "+fromDate+"\t"+toDate+"\t"+stmtType+"\t"+stmtStatus);
    StatementFeed().execute(stmtType, stmtStatus, fromDate, toDate);
}

execute();