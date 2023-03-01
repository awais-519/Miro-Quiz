const mySql = require('mysql');

// Create a connection to the MySQL database
const connectDb = mySql.createConnection({
	host: 'localhost',
	user: 'quiz_user',
	password: 'quiz_password',
	database: 'quiz_db',
});

module.exports = connectDb;
