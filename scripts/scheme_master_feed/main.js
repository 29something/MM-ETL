let LocationFeed = require('./scheme_master_feed')
let moment = require('moment')

function execute() {
    let feed = LocationFeed();
    console.log("running scheme master feed..");
    feed.execute();
}

execute();