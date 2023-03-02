const Express = require('express');
const quizzesRoute = require('./Routes/quizzes');
const bodyParser = require('body-parser');
const connection = require('./Database/connection');
const { PORT } = require('./config');

const app = Express();

app.listen(PORT, () => console.log(`SERVERS LISTENING ON PORT`));

// Connect to the database
connection.connect((err) => {
	if (err) {
		console.error('Error connecting to MySQL database: ', err);
	} else {
		console.log('Connected to MySQL database');
	}
});

// Middleware to parse JSON requests
app.use(bodyParser.json());

app.use('/quizzes', quizzesRoute);

app.get('/', (Req, res) => {
	res.send('WELCOME TO HOMEPAGE');
});
