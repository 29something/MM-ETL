const axios = require('axios');
let config = require('../../config/config');
const csv = require('csvtojson')

function BankFeed() {
    this.sucessCount = 0
    this.failedCount = 0;
    this.totalCount = 0;
    this.batchSize = 100;
}

BankFeed.prototype = {
    constructor: BankFeed,
    execute: function () {
        console.log("load the csv file for processing..")
        this.fetchDataAndProcess();
    },

    fetchDataAndProcess: function () {
        let callback = this.fetchDataCallback.bind(this)
        const csvFilePath = "../../data/csv/bank.csv"
        csv().fromFile(csvFilePath).then(callback)
    },

    fetchDataCallback: function (bankList) {
        console.log("csv file processed.")
        console.log("processing records..")
        console.log("total location records :: " + bankList.length)
        console.log("batch size :: " + this.batchSize)
        let dataList = []
        for (let i = 0; i < bankList.length; i++) {
            let bankData = bankList[i];
            dataList.push({
                bank: bankData['BANK'],
                ifsc: bankData['IFSC'],
                branch: bankData['BRANCH'],
                address: bankData['ADDRESS'],
                contact: bankData['CONTACT'],
                city: bankData['CITY'],
                district: bankData['DISTRICT'],
                state: bankData['STATE']
            });
            if (dataList.length === this.batchSize) {
                this.totalCount = this.totalCount + 1;
                this.processData(dataList);
                dataList = [];
            }
        }

        if (dataList.length > 0) {
            this.totalCount = this.totalCount + 1;
            this.processData(dataList);
        }
    },

    processData: async function (bankDataList) {
        try {
            let response = await axios.post(
                config.etl.mmMasterSvcUrl + '/banks',
                {"banks": bankDataList});
            this.sucessCount = this.sucessCount + 1;
        } catch (err) {
            this.failedCount = this.failedCount + 1;
        }

        this.printStats();
    },

    printStats: function () {


        console.log("\nbatch update :: success[" + this.sucessCount + "]" +
            "\t failed[" + this.failedCount + "]" +
            "\t total[" + this.totalCount + "]");
    }
}

module.exports = function () {
    return new BankFeed();
}