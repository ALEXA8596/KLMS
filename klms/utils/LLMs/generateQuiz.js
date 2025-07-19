import { callLLM } from "./callLLM";

const promptToSendToUser = `You are a teacher and an expert quiz maker. Generate a quiz for the topic: {topic}. Each quiz question should have a question text and multiple choice answers.`;

const prompt = `You are a teacher and an expert quiz maker. Generate a quiz for the topic: {topic}. Each quiz question should have a question text and multiple choice answers. Format the output as JSON with the following structure:
{
    "quizTitle": "Quiz Title",
    "quizSynopsis": "A brief description of the quiz, including its objectives",
    "questions": [
        {
            "question": "Question text",
            "questionType": "text",
            "answers": [
                "Answer 1",
                "Answer 2",
                "Answer 3",
                "Answer 4"
            ],
            "correctAnswer": "index of the correct answer plus 1 (1-based index)",
            "messageForCorrectAnswer": "Message to show when the answer is correct",
            "messageForIncorrectAnswer": "Message to show when the answer is incorrect",
            "explanation": "Explanation of the correct answer",
            "points": 10
        }
    ]
}`;

async function generateQuiz(topic, options = { provider: "hackclub" }) {
  return await callLLM(prompt.replace("{topic}", topic), {
    ...options,
  });
}

export { generateQuiz, promptToSendToUser, prompt };
