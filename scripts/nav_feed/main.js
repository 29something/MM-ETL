let LocationFeed = require('./nav_feed')
let moment = require('moment')

function execute() {
    let feed = LocationFeed();
    console.log("running location feed..");
    feed.execute();
}

execute();