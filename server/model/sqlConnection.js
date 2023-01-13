const configuration = require('../../config/configuration');

let mySql={
    connectionLimit: 300000,
    host     : configuration.databaseDetails.host,
    user     :configuration.databaseDetails.username,
    password : configuration.databaseDetails.password,
    database:  configuration.databaseName,
    debug: false,
    charset : 'utf8mb4',
    // collate: "utf8mb4_unicode_ci",
    multipleStatements: true
}
module.exports=mySql