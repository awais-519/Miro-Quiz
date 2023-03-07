const express = require('express');
const router = express.Router();
const db = require('../Database/connection');
const { check, validationResult } = require('express-validator');
const { NULL } = require('mysql/lib/protocol/constants/types');

// Create a Quiz

// API route for creating a new Quiz
router.post('/', (req, res) => {
	const quiz = req.body;

	// Check for required fields
	if (!quiz.title || !quiz.questions) {
		return res.status(400).json({
			success: false,
			errors: {
				code: 'ERR_MISSING_FIELD',
				desc: 'Required field is missing',
			},
			data: null,
		});
	}

	// Validate quiz object
	const title = quiz.title.trim();
	const description = quiz.description ? quiz.description.trim() : null;

	// Check for valid title
	if (!title) {
		return res.status(400).json({
			success: false,
			errors: {
				code: 'ERR_INVALID_TITLE',
				desc: 'Title is invalid',
			},
			data: null,
		});
	}

	// Validate questions array
	if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
		return res.status(400).json({
			success: false,
			errors: {
				code: 'ERR_INVALID_QUESTIONS',
				desc: 'Questions array is invalid',
			},
			data: null,
		});
	}

	const questions = quiz.questions.map((question) => {
		// Check for required fields
		if (!question.question_text || !question.choices) {
			return res.status(400).json({
				success: false,
				errors: {
					code: 'ERR_MISSING_FIELD',
					desc: 'Required field is missing',
				},
				data: null,
			});
		}

		// Validate question object
		const questionText = question.question_text.trim();
		const isMandatory = question.is_mandatory ? true : false;

		// Check for valid question text
		if (!questionText) {
			return res.status(400).json({
				success: false,
				errors: {
					code: 'ERR_INVALID_QUESTION_TEXT',
					desc: 'Question text is invalid',
				},
				data: null,
			});
		}

		// Validate choices array
		if (!Array.isArray(question.choices) || question.choices.length === 0) {
			return res.status(400).json({
				success: false,
				errors: {
					code: 'ERR_INVALID_CHOICES',
					desc: 'Choices array is invalid',
				},
				data: null,
			});
		}

		const choices = question.choices.map((choice) => {
			// Check for required fields
			if (!choice.choice_text) {
				return res.status(400).json({
					success: false,
					errors: {
						code: 'ERR_MISSING_FIELD',
						desc: 'Required field is missing',
					},
					data: null,
				});
			}

			// Validate choice object
			const choiceText = choice.choice_text.trim();
			const isCorrect = choice.is_correct ? true : false;

			// Check for valid choice text
			if (!choiceText) {
				return res.status(400).json({
					success: false,
					errors: {
						code: 'ERR_INVALID_CHOICE_TEXT',
						desc: 'Choice text is invalid',
					},
					data: null,
				});
			}

			return {
				choice_text: choiceText,
				is_correct: isCorrect,
			};
		});

		return {
			question_text: questionText,
			is_mandatory: isMandatory,
			choices: choices,
		};
	});

	// Insert quiz, questions, and choices into database
	db.query(
		'INSERT INTO quizzes SET ?',
		{ title: title, description: description },
		(err, result) => {
			if (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					errors: {
						code: 'ERR_DATABASE',
						desc: 'Failed to insert data into the database',
					},
					data: null,
				});
			}

			const quizId = result.insertId;

			questions.forEach((question) => {
				db.query(
					'INSERT INTO questions SET ?',
					{
						quiz_id: quizId,
						question_text: question.question_text,
						is_mandatory: question.is_mandatory,
					},
					(err, result) => {
						if (err) {
							console.error(err);
							return res.status(500).json({
								success: false,
								errors: {
									code: 'ERR_DATABASE',
									desc: 'Failed to insert data into the database',
								},
								data: null,
							});
						}

						const questionId = result.insertId;

						question.choices.forEach((choice) => {
							db.query(
								'INSERT INTO choices SET ?',
								{
									question_id: questionId,
									choice_text: choice.choice_text,
									is_correct: choice.is_correct,
								},
								(err, result) => {
									if (err) {
										console.error(err);
										return res.status(500).json({
											success: false,
											errors: {
												code: 'ERR_DATABASE',
												desc: 'Failed to insert data into the database',
											},
											data: null,
										});
									}
								}
							);
						});
					}
				);
			});

			return res.json({
				success: true,
				data: {
					id: quizId,
					title: title,
					description: description,
					questions: questions,
				},
				errors: null,
			});
		}
	);
});

// Get all Quizzes

router.get('/', (req, res) => {
	const query = `
    SELECT q.id as quiz_id, q.title, q.description, 
           qu.id as question_id, qu.question_text, qu.is_mandatory,
           c.id as choice_id, c.choice_text, c.is_correct
    FROM quizzes q 
    JOIN questions qu ON q.id = qu.quiz_id 
    JOIN choices c ON qu.id = c.question_id;
  `;
	db.query(query, (err, result) => {
		if (err) {
			console.error(err);
			return res.json({
				success: false,
				error: {
					code: 500,
					desc: 'Internal server error',
				},
				data: null,
			});
		}

		// Group the data by quiz ID
		const quizzes = result.reduce((acc, row) => {
			const {
				quiz_id,
				title,
				description,
				question_id,
				question_text,
				is_mandatory,
			} = row;
			const question = {
				id: question_id,
				text: question_text,
				isMandatory: is_mandatory,
				choices: [],
			};
			const choice = {
				id: row.choice_id,
				text: row.choice_text,
				isCorrect: row.is_correct,
			};
			if (!acc[quiz_id]) {
				acc[quiz_id] = {
					id: quiz_id,
					title: title,
					description: description,
					questions: [question],
				};
			} else {
				const existingQuestion = acc[quiz_id].questions.find(
					(q) => q.id === question_id
				);
				if (existingQuestion) {
					existingQuestion.choices.push(choice);
				} else {
					question.choices.push(choice);
					acc[quiz_id].questions.push(question);
				}
			}
			return acc;
		}, {});

		return res.json({
			success: true,
			error: null,
			data: Object.values(quizzes),
		});
	});
});

// Get a quiz by id
router.get('/:quizId', (req, res) => {
	const { quizId } = req.params;
	const query = `
    SELECT q.id as quiz_id, q.title, q.description, 
           qu.id as question_id, qu.question_text, qu.is_mandatory,
           c.id as choice_id, c.choice_text, c.is_correct
    FROM quizzes q 
    JOIN questions qu ON q.id = qu.quiz_id 
    JOIN choices c ON qu.id = c.question_id
    WHERE q.id = ?;
  `;
	db.query(query, [quizId], (err, result) => {
		if (err) {
			console.error(err);
			return res.json({
				success: false,
				error: {
					code: 500,
					desc: 'Internal server error',
				},
				data: null,
			});
		}

		if (result.length === 0) {
			return res.json({
				success: false,
				error: {
					code: 404,
					desc: 'Quiz not found',
				},
				data: null,
			});
		}

		// Build the nested object with quiz, question, and choice data
		const quiz = {
			id: result[0].quiz_id,
			title: result[0].title,
			description: result[0].description,
			questions: [],
		};
		let currentQuestion = null;
		result.forEach((row) => {
			const { question_id, question_text, is_mandatory } = row;
			if (!currentQuestion || currentQuestion.id !== question_id) {
				currentQuestion = {
					id: question_id,
					text: question_text,
					isMandatory: is_mandatory,
					choices: [],
				};
				quiz.questions.push(currentQuestion);
			}
			currentQuestion.choices.push({
				id: row.choice_id,
				text: row.choice_text,
				isCorrect: row.is_correct,
			});
		});

		return res.json({
			success: true,
			error: null,
			data: quiz,
		});
	});
});

// Update a quiz by id

router.put('/:id', async (req, res) => {
	const id = req.params.id;
	const { title, description, questions } = req.body;

	try {
		// Start a transaction to ensure atomicity
		await db.beginTransaction();

		// Delete existing questions and choices for the quiz
		await db.query(
			'DELETE FROM choices WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ?)',
			[id]
		);
		await db.query('DELETE FROM questions WHERE quiz_id = ?', [id]);

		// Update the quiz
		await db.query(
			'UPDATE quizzes SET title = ?, description = ? WHERE id = ?',
			[title, description, id]
		);

		// Add the updated questions and choices for the quiz
		for (const question of questions) {
			const { question_text, is_mandatory, choices } = question;

			// Insert the question
			await db.query(
				'INSERT INTO questions (quiz_id, question_text, is_mandatory) VALUES (?, ?, ?)',
				[id, question_text, is_mandatory],
				(err, result) => {
					const questionId = result.insertId;
					// Insert the choices for the question
					for (const choice of choices) {
						const { choice_text, is_correct } = choice;
						db.query(
							'INSERT INTO choices (question_id, choice_text, is_correct) VALUES (?, ?, ?)',
							[questionId, choice_text, is_correct]
						);
					}
				}
			);
		}

		// Commit the transaction
		await db.commit();

		// Send the success response
		res.json({
			success: true,
			error: null,
			data: `The quiz with id: ${id} has been updated.`,
		});
	} catch (error) {
		// Rollback the transaction on error
		await db.rollback();

		// Send the error response
		res.status(500).json({
			success: false,
			error: {
				code: error.code,
				desc: error.message,
			},
			data: null,
		});
	}
});

// DELETE A QUIZ
router.delete('/:id', async (req, res) => {
	const id = req.params.id;

	try {
		// Start a transaction to ensure atomicity
		await db.beginTransaction();

		// Delete existing questions and choices for the quiz
		await db.query(
			'DELETE FROM choices WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ?)',
			[id]
		);
		await db.query('DELETE FROM questions WHERE quiz_id = ?', [id]);

		// Delete quiz
		await db.query('DELETE FROM quizzes WHERE id = ?', [id]);

		// Commit the transaction
		await db.commit();

		// Send the success response
		res.json({
			success: true,
			error: null,
			data: `The quiz with id ${id} has been deleted.`,
		});
	} catch (error) {
		// Rollback the transaction on error
		await db.rollback();

		// Send the error response
		res.status(500).json({
			success: false,
			error: {
				code: error.code,
				desc: error.message,
			},
			data: null,
		});
	}
});

module.exports = router;
