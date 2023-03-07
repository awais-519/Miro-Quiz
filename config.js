const dotenv = require('dotenv');

dotenv.config();

const DB = {
	host: process.env.DB_HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
	database: process.env.DB_DBNAME,
};
const PORT = process.env.PORT;

module.exports = { PORT, DB };
