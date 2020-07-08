const axios = require('axios');
let config = require('../../config/config');

function StatementFeed() {
}

StatementFeed.prototype = {
    constructor: StatementFeed,
    execute: function (statementType, orderStatus, fromDate, toDate) {
        console.log("Process::"+statementType+"::"+orderStatus+"::"+fromDate+"::"+toDate);
        this.validFlag = (orderStatus==="VALID")?"Y":"N";
        this.fetchDataAndProcess(statementType, orderStatus, fromDate, toDate);
    },

    fetchDataAndProcess: function (statementType, orderStatus, fromDate, toDate) {
        let callback = this.fetchDataCallback.bind(this);
        if(statementType.toUpperCase()==='ORDER_STATUS'){
            axios.post(config.etl.mmThirdPartySvcUrl + '/bse/order/status', {
                "clientCode": "",
                "fromDate": fromDate,
                "toDate": toDate,
                "orderId": "",
                "orderStatus": orderStatus,
                "orderType": "All",
                "settlementType": "ALL",
                "subOrderType": "All",
                "transType":"All"
            }).then(callback).catch(error => {
                console.log(error);
            });
        }else {
            axios.post(config.etl.mmThirdPartySvcUrl + '/bse/order/statement', {
                "statementType": statementType,
                "clientCode": "",
                "fromDate": fromDate,
                "toDate": toDate,
                "orderId": "",
                "orderStatus": orderStatus,
                "orderType": "All",
                "settlementType": "ALL",
                "subOrderType": "All"
            }).then(callback).catch(error => {
                console.log(error);
            });
        }
    },

    fetchDataCallback: function (response) {
        let dataList = response.data.data;
        for (let i = 0; i < dataList.length; i++) {
            let stmtData = dataList[i];
            stmtData['validFlag'] = this.validFlag;
            this.processData(stmtData);
        }
    },

    processData: function (stmtData) {
        console.log(stmtData);
        axios.put(config.etl.mmApi.url + '/transactions/bse/' + stmtData.orderNo,
            stmtData, {
                auth: {
                    username: config.etl.mmApi.username,
                    password: config.etl.mmApi.password
                }
            })
            .then(response=>{
                console.log("processed :: "+stmtData.orderNo);
            })
            .catch(error=> {
                console.log("failed :: "+stmtData.orderNo);
            })
    }

}

module.exports = function () {
    return new StatementFeed();
}