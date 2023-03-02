const mySql = require('mysql');
const { DB } = require('../config');

// Create a connection to the MySQL database
const connectDb = mySql.createConnection(DB);

module.exports = connectDb;
