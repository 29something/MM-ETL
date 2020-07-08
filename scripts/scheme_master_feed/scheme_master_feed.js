const axios = require('axios');
let config = require('../../config/config');
const fs = require('fs');
const readline = require('readline');
let moment = require('moment');

function SchemeMasterFeed() {
    this.sucessCount = 0
    this.failedCount = 0;
    this.totalCount = 0;
    this.batchSize = 100;
    this.dataList = [];
}

SchemeMasterFeed.prototype = {
    constructor: SchemeMasterFeed,
    execute: function () {
        console.log("load the pipe separated file for processing..")
        this.fetchDataAndProcess();
    },

    fetchDataAndProcess: function () {
        let processDataListCallback = this.processDataList.bind(this)
        let processLineCallback = this.processLine.bind(this)
        const navFile = "../../data/psv/SCHMSTRPHY.txt"
        const rl = readline.createInterface({
            input: fs.createReadStream(navFile),
            output: process.stdout,
            terminal: false
        });
        rl.on('line', processLineCallback);
        rl.on('close', processDataListCallback);
    },

    processLine: function (line) {
        if(!line.startsWith("Unique No")){
            let fields = line.split("|")
            let schemeData = this.prepareSchemeData(fields);
            //console.log(schemeData);
            this.dataList.push(schemeData);
        }
    },

    prepareSchemeData: function(fields){
        return {
        uniqueNo:fields[0],
        schemeCode:fields[1],
        rtaSchemeCode:fields[2],
        amcSchemeCode:fields[3],
        isin:fields[4],
        amcCode:fields[5],
        schemeType:fields[6],
        schemePlan:fields[7],
        schemeName:fields[8],
        purchaseAllowed:fields[9],
        purchaseTransactionMode:fields[10],
        minimumPurchaseAmount:fields[11],
        additionalPurchaseAmount:fields[12],
        maximumPurchaseAmount:fields[13],
        purchaseAmountMultiplier:fields[14],
        purchaseCutoffTime:fields[15],
        redemptionAllowed:fields[16],
        redemptionTransactionMode:fields[17],
        minimumRedemptionQty:fields[18],
        redemptionQtyMultiplier:fields[19],
        maximumRedemptionQty:fields[20],
        redemptionAmountMinimum:fields[21],
        redemptionAmountMaximum:fields[22],
        redemptionAmountMultiple:fields[23],
        redemptionCutoffTime:fields[24],
        rtaAgentCode:fields[25],
        amcActiveFlag:fields[26],
        dividendReinvestmentFlag:fields[27],
        sipFlag:fields[28],
        stpFlag:fields[29],
        swpFlag:fields[30],
        switchFlag:fields[31],
        settlementType:fields[32],
        amcInd:fields[33],
        faceValue:fields[34],
        startDate:fields[35],
        endDate:fields[36],
        exitLoadFlag:fields[37],
        exitLoad:fields[38],
        lockInPeriodFlag:fields[39],
        lockInPeriod:fields[40],
        channelPartnerCode:fields[41]
        }
    },

    processDataList: function () {
        console.log("file processed.")
        console.log("processing records..")
        console.log("total records :: " + this.dataList.length)
        console.log("batch size :: " + this.batchSize)
        let currentDate = moment();
        console.log("importing schemes active as on "+moment(currentDate).format("MMM DD YYYY"))
        let dataList = []
        for (let i = 0; i < this.dataList.length; i++) {
            let data = this.dataList[i];
            let schemeEndDate = moment(currentDate,"MMM DD YYYY")
            if(schemeEndDate>=currentDate) {
                dataList.push(data);
                if (dataList.length === this.batchSize) {
                    this.totalCount = this.totalCount + 1;
                    this.saveDataList(dataList);
                    dataList = [];
                }
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
                config.etl.mmMasterSvcUrl + '/schemes',
                {"schemes": data});
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
    return new SchemeMasterFeed();
}