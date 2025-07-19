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
            <FlashcardForm onSubmit={handleSubmit} submitting={submitting} />
          </div>

          {result && (
            <div className="mt-8">
              <FlashcardFormResult result={result} />
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
    </div>
  );
}
