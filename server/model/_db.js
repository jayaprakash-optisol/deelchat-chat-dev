const Sequelize = require('sequelize');
const config = require('../../config/configuration')
 

const db = new Sequelize(config.databaseName,config.databaseDetails.username, config.databaseDetails.password,{
  dialect: 'mysql',
  host: config.databaseDetails.host,
  server:  config.databaseDetails.host,
  database: config.databaseName,
   
})


module.exports = db;