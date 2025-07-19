import { callLLM } from "./callLLM";

const promptToSendToUser = `You are a teacher and an expert flashcard maker. Generate a set of flashcards for the topic: {topic}. Each flashcard should have a question and an answer or a vocabulary word and its definition.`

const prompt = 
`You are a teacher and an expert flashcard maker. Generate a set of flashcards for the topic: {topic}. Each flashcard should have a question and an answer or a vocabulary word and its definition. Format the output as JSON with the following structure:
{
  "flashcards": [
    {
      "frontHTML": "Question text",
      "backHTML": "Answer text"
    },
    ...
  ]
}`;

async function generateFlashcards(topic, options = { provider: "hackclub" }) {
    return await callLLM(prompt.replace("{topic}", topic), {
        ...options,
    });
}

export {
    generateFlashcards,
    promptToSendToUser,
    prompt
}