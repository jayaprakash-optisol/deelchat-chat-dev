// let config = {
//     host    : '34.218.121.25',
//     user    : 'root',
//     password: 'db@dm1n',
//     database: 'deelchattest'
//   };

//   module.exports = config;
const config = require('../../config/configuration');

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: config.databaseDetails.host,
    port: 3306,
    user: config.databaseDetails.username,
    password: config.databaseDetails.password,
    database: config.databaseName,
    charset: 'utf8mb4',
    // collate: "utf8mb4_unicode_ci",
    multipleStatements: true,
  },
  pool: {
    min: 1,
    max: 20,
  },
});

// const Bookshelf = require('bookshelf')(knex);

module.exports = knex;
