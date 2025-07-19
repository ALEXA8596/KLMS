import { callLLM } from "./callLLM";

const promptToSendToUser = `You are a teacher and an expert lesson planner. Generate a Markdown Lesson Article for the topic: {topic}. Each lesson should have a title, an objective, and a structured outline with sections and subsections. Include key points, examples, and any relevant resources.`;

const prompt = `You are a teacher and an expert lesson planner. Generate a Markdown Lesson Article for the topic: {topic}. Each lesson should have a title, an objective, and a structured outline with sections and subsections. Include key points, examples, and any relevant resources. Format the output as JSON with the following structure:
{
    "title": "Lesson Title",
    "description": "A brief description of the lesson, including its objectives",
    "content": "The lesson content in Markdown format"
}`;

async function generateLesson(topic, options = { provider: "hackclub" }) {
  return await callLLM(prompt.replace("{topic}", topic), {
    ...options,
  });
}

export { generateLesson, promptToSendToUser, prompt };
