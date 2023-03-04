const dotenv = require('dotenv');

dotenv.config();

const DB = {
	host: process.env.DB_HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DBNAME,
	port: process.env.DB_PORT,
	connection_limit: process.env.DB_CONNECTION_LIMIT,
};
const PORT = process.env.PORT;

module.exports = { PORT, DB };
