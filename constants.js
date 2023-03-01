export const quizData = {
	title: 'My Quiz',
	description: 'A quiz about something',
	questions: [
		{
			question: 'What is 1 + 1?',
			choices: [
				{ text: '1', isCorrect: false },
				{ text: '2', isCorrect: true },
				{ text: '3', isCorrect: false },
			],
			isRequired: true,
		},
		{
			question: 'What is the capital of France?',
			choices: [
				{ text: 'London', isCorrect: false },
				{ text: 'Paris', isCorrect: true },
				{ text: 'Berlin', isCorrect: false },
			],
			isRequired: false,
		},
	],
};
