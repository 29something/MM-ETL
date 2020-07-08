const axios = require('axios');
let config = require('../../config/config');
const csv = require('csvtojson')
const fs = require('fs');
const readline = require('readline');

function NAVFeed() {
    this.sucessCount = 0
    this.failedCount = 0;
    this.totalCount = 0;
    this.batchSize = 100;
    this.navList = [];
}

NAVFeed.prototype = {
    constructor: NAVFeed,
    execute: function () {
        console.log("load the csv file for processing..")
        this.fetchDataAndProcess();
    },

    fetchDataAndProcess: function () {
        let processDataListCallback = this.processDataList.bind(this)
        let processLineCallback = this.processLine.bind(this)
        const navFile = "../../data/csv/nav.txt"
        const rl = readline.createInterface({
            input: fs.createReadStream(navFile),
            output: process.stdout,
            terminal: false
        });
        rl.on('line', processLineCallback);
        rl.on('close', processDataListCallback);
    },

    processLine: function (line) {
        let firstSeparatorIdx = line.indexOf(";")
        let lastSeparatorIdx = line.lastIndexOf(";")
        if (firstSeparatorIdx > -1 && lastSeparatorIdx > -1 &&
            firstSeparatorIdx < lastSeparatorIdx) {
            let fields = line.split(";")
            this.navList.push({
                "schemeCode": fields[0],
                "isin": {
                    "growth": fields[1],
                    "dividend": fields[2]
                },
                "schemeName": fields[3],
                "netAssetValue": fields[4],
                "date":fields[5]
            })
        }
    },

    processDataList: function () {
        console.log("nav file processed.")
        console.log("processing nav records..")
        console.log("total nav records :: " + this.navList.length)
        console.log("batch size :: " + this.batchSize)
        let dataList = []
        for (let i = 0; i < this.navList.length; i++) {
            let navData = this.navList[i];
            dataList.push(navData);
            if (dataList.length === this.batchSize) {
                this.totalCount = this.totalCount + 1;
                this.saveDataList(dataList);
                dataList = [];
            }
        }

        if (dataList.length > 0) {
            this.totalCount = this.totalCount + 1;
            this.saveDataList(dataList);
        }
    },

    saveDataList: async function (data) {
        try {
            let response = await axios.post(
                config.etl.mmMasterSvcUrl + '/nav',
                {"data": data});
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
    return new NAVFeed();
}