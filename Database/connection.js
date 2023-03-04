const mySql = require('mysql');
const { DB } = require('../config');

// Create a connection to the MySQL database
const dbConnection = mySql.createConnection(DB);

module.exports = dbConnection;
