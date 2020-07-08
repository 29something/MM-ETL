let BankFeed = require('./bank_feed')

function execute() {
    let feed = BankFeed();
    console.log("running bank feed..");
    feed.execute();
}

execute();