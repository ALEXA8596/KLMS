"use client";
import React, { useState } from "react";
import FlashcardForm from "@/components/FlashcardForm";
import FlashcardFormResult from "@/components/FlashcardFormResult";
import Header from "@/components/Header";
import { useSession } from "next-auth/react";

interface FlashcardData {
  flashcardTitle: string;
  flashcardDescription: string;
  cards: Array<{
    front: string;
    back: string;
    hint: string;
    difficulty: string;
  }>;
}

export default function CreateFlashcardPage() {
  const { data: session } = useSession();
  const [result, setResult] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // AI Flashcard Generation state
  const [aiTopic, setAiTopic] = useState("");
  const [aiProvider, setAiProvider] = useState("hackclub");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // For transferring AI output to form
  const [aiFormValues, setAiFormValues] = useState<any>(null);

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiGenerating(true);
    setAiResult(null);

    try {
      const response = await fetch("/api/ai/create/flashcard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: aiTopic,
          options: { provider: aiProvider },
        }),
      });

      const data = await response.json();

      if (response.ok && data.flashcards) {
        setAiResult(JSON.stringify(data.flashcards, null, 2));
      } else {
        setAiResult(`Error generating flashcards: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error generating AI flashcards:", error);
      setAiResult(`Error generating flashcards: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (flashcardData: FlashcardData) => {
    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/flashcards/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: flashcardData.flashcardTitle,
          description: flashcardData.flashcardDescription,
          cards: flashcardData.cards.map(card => ({
            front: card.front,
            back: card.back,
            hint: card.hint,
            difficulty: card.difficulty
          })),
          parentId: null, // For now, new flashcards don't have a parent
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(`Flashcard set created successfully!\n\nFlashcard ID: ${data.flashcard.id}\nTitle: ${data.flashcard.title}\nDescription: ${data.flashcard.description}\nCards: ${data.flashcard.cards.length}\n\nYou can view your flashcard set at: /app/flashcard/${data.flashcard.id}`);
      } else {
        setResult(`Error creating flashcard set: ${data.error}`);
      }
    } catch (error) {
      console.error("Error submitting flashcard:", error);
      setResult(`Error creating flashcard set: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userData={session?.user || null} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Create Flashcard Set
            </h1>
            <p className="text-lg text-gray-600">
              Create a new set of flashcards to help you study and learn new concepts.
            </p>
          </div>


          <div className="bg-white rounded-lg shadow-lg p-6">
            <FlashcardForm
              onSubmit={handleSubmit}
              submitting={submitting}
              initialValues={aiFormValues}
            />
          </div>


          {result && (
            <div className="mt-8">
              <FlashcardFormResult result={result} onUseResult={undefined} />
            </div>
          )}

          {submitting && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-200 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-800">Creating flashcard set...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Divider */}
      <div className="flex items-center justify-center my-8">
        <div className="flex-grow border-t border-gray-300"></div>
        <div className="mx-4 bg-gray-50 px-4 py-2 rounded-full">
          <span className="text-gray-500 font-medium">OR</span>
        </div>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* AI Flashcard Generation Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI Flashcard Generator
          </h2>
          <p className="text-gray-600 mb-4">
            Let AI create flashcards for you on any topic. The AI will generate a JSON format that you can copy and use.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-left">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Tip:</strong> Be specific with your topic for better results. For example:
                  <br />• "Spanish vocabulary for food and dining"
                  <br />• "JavaScript array methods with examples"
                  <br />• "Key battles of World War II with dates"
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleAiGenerate} className="space-y-4">
          <div>
            <label htmlFor="aiTopic" className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <input
              type="text"
              id="aiTopic"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
              placeholder="Enter a topic (e.g., 'Spanish vocabulary for beginners', 'JavaScript fundamentals', 'World War II events')"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="aiProvider" className="block text-sm font-medium text-gray-700 mb-2">
              AI Provider
            </label>
            <select
              id="aiProvider"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
            >
              <option value="hackclub">Hack Club (Free)</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Gemini</option>
              <option value="xAI">xAI</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 disabled:bg-gray-400 font-medium"
            disabled={aiGenerating || !aiTopic.trim()}
          >
            {aiGenerating ? "Generating Flashcards..." : "Generate Flashcards with AI"}
          </button>
        </form>

        {aiGenerating && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 border border-purple-200 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              <span className="text-purple-800">AI is generating your flashcards...</span>
            </div>
          </div>
        )}

        {aiResult && (
          <div className="mt-6">
            <FlashcardFormResult
              result={aiResult}
              onUseResult={(parsed: { flashcardTitle: any; flashcardDescription: any; cards: any; }) => {
                // Accepts either an array of cards or a full object
                if (Array.isArray(parsed)) {
                  setAiFormValues({
                    flashcardTitle: "",
                    flashcardDescription: "",
                    cards: parsed,
                  });
                } else if (parsed && typeof parsed === "object") {
                  setAiFormValues({
                    flashcardTitle: parsed.flashcardTitle || "",
                    flashcardDescription: parsed.flashcardDescription || "",
                    cards: parsed.cards || [],
                  });
                }
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
