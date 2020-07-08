let service = require("./service");

let env = service.environment.toLowerCase();
console.log("environment :: "+env)
module.exports = {
    etl: require("./" + env + "/etl"),
    env: env
};