const axios = require('axios');
let config = require('../../config/config');
const csv = require('csvtojson')

function LocationFeed() {
    this.sucessCount = 0
    this.failedCount = 0;
    this.totalCount = 0;
    this.batchSize = 100;
}

LocationFeed.prototype = {
    constructor: LocationFeed,
    execute: function () {
        console.log("load the csv file for processing..")
        this.fetchDataAndProcess();
    },

    fetchDataAndProcess: function () {
        let callback = this.fetchDataCallback.bind(this)
        const csvFilePath = "../../data/csv/pincode.csv"
        csv().fromFile(csvFilePath).then(callback)
    },

    fetchDataCallback: function (locationList) {
        console.log("csv file processed.")
        console.log("processing records..")
        console.log("total location records :: "+locationList.length)
        console.log("batch size :: "+this.batchSize)
        let dataList = []
        for (let i = 0; i < locationList.length; i++) {
            let locationData = locationList[i];
            dataList.push({
                officeName: locationData['officename'],
                pincode: locationData['pincode'],
                officeType: locationData['officeType'],
                deliveryStatus: locationData['Deliverystatus'],
                divisionName: locationData['divisionname'],
                regionName: locationData['regionname'],
                circleName: locationData['circlename'],
                taluk: locationData['Taluk'],
                districtName: locationData['Districtname'],
                stateName: locationData['statename'],
                telephone: locationData['Telephone'],
                relatedSuboffice: locationData['Related Suboffice'],
                relatedHeadoffice: locationData['Related Headoffice'],
                longitude: locationData['longitude'],
                latitude: locationData['latitude']
            });

            if (dataList.length === this.batchSize) {
                this.totalCount = this.totalCount+1;
                this.processData(dataList);
                dataList = [];
            }
        }

        if (dataList.length > 0) {
            this.totalCount = this.totalCount+1;
            this.processData(dataList);
        }
    },

    processData: async function (locationDataList) {
        try {
            let response = await axios.post(
                config.etl.mmMasterSvcUrl + '/locations',
                {"locations": locationDataList});
            this.sucessCount = this.sucessCount + 1;
        } catch (err) {
            this.failedCount = this.failedCount + 1;
        }

        this.printStats();
    },

    printStats: function () {


        console.log("\nbatch update :: success[" + this.sucessCount+"]" +
            "\t failed[" + this.failedCount +"]" +
            "\t total[" + this.totalCount + "]");
    }
}

module.exports = function () {
    return new LocationFeed();
}