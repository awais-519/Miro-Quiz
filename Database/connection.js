const mySql = require('mysql');
// const { DB } = require('../config');

// Create a connection to the MySQL database
const connectDb = mySql.createConnection({
	host: 'localhost',
	user: 'quiz_user',
	password: 'quiz_password',
	database: 'quiz_db',
});

module.exports = connectDb;
