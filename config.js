const dotenv = require('dotenv');

dotenv.config();

const DB = {
	host: 'localhost',
	user: 'quiz_user',
	password: 'quiz_password',
	database: 'quiz_db',
};
const PORT = process.env.PORT;

module.exports = { PORT, DB };
