const express = require('express');
const router = express.Router();
const connection = require('../Database/connection');

// Create a Quiz
router.post('/', (req, res) => {
	const { title, description, questions } = req.body;
	const quiz = { title, description, questions };

	connection.query('INSERT INTO quizzes SET ?', quiz, (error, result) => {
		if (error) {
			res.status(500).json({
				success: false,
				error: error.code,
				data: null,
			});
		} else {
			const insertId = result.insertId;
			quiz.id = insertId;
			res.status(201).json({
				success: true,
				error: null,
				data: quiz,
			});
		}
	});
});

// Get all Quizzes
router.get('/', (req, res) => {
	connection.query('SELECT * FROM quizzes', (error, results) => {
		if (error) {
			res.status(500).json({
				success: false,
				error: error.code,
				data: null,
			});
		} else {
			res.status(200).json({
				success: true,
				error: null,
				data: results,
			});
		}
	});
});

// Get a quiz by id
router.get('/:id', (req, res) => {
	const quizId = req.params.id;
	connection.query(
		'SELECT * FROM quizzes WHERE id = ?',
		[quizId],
		(error, results) => {
			if (error) {
				res.status(500).json({
					success: false,
					error: error.code,
					data: null,
				});
			} else if (results.length === 0) {
				res.status(404).json({
					success: false,
					error: 'QUIZ_NOT_FOUND',
					data: null,
				});
			} else {
				const quiz = results[0];
				res.status(200).json({
					success: true,
					error: null,
					data: quiz,
				});
			}
		}
	);
});

// Update a quiz by id
router.put('/:id', (req, res) => {
	const quizId = req.params.id;
	const { title, description, questions } = req.body;
	const quiz = { title, description, questions };

	connection.query(
		'UPDATE quizzes SET ? WHERE id = ?',
		[quiz, quizId],
		(error, results) => {
			if (error) {
				res.status(500).json({
					success: false,
					error: error.code,
					data: null,
				});
			} else if (results.affectedRows === 0) {
				res.status(404).json({
					success: false,
					error: 'QUIZ_NOT_FOUND',
					data: null,
				});
			} else {
				quiz.id = quizId;
				res.status(200).json({
					success: true,
					error: null,
					data: quiz,
				});
			}
		}
	);
});
//Delete a Quiz on the base of insertId
router.delete('/:id', (req, res) => {
	const quizId = req.params.id;

	connection.query(
		'DELETE FROM quizzes WHERE id = ?',
		quizId,
		(err, result) => {
			if (err) {
				res.status(500).json({
					success: false,
					error: err.code,
					data: null,
				});
			} else if (result.affectedRows === 0) {
				res.status(404).json({
					success: false,
					error: 'QUIZ_NOT_FOUND',
					data: null,
				});
			} else {
				res.json({
					success: true,
					error: null,
					data: `Quiz with ID ${quizId} deleted successfully`,
				});
			}
		}
	);
});

module.exports = router;
