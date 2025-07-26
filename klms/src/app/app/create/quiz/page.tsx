"use client";
import { useState, useEffect, SetStateAction } from "react";
import Header from "@/components/Header";
import LessonSelect from "@/components/LessonSelect";
import QuizForm from "@/components/QuizForm";
import QuizFormResult from "@/components/QuizFormResult";

export default function Quiz() {
    const [userData, setUserData] = useState<any>(null);
    const [userLessonHierarchies, setUserLessonHierarchies] = useState<any>(null);
    const [parentId, setParentId] = useState<string>("");
    const [result, setResult] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // AI Quiz Generation state
    const [aiTopic, setAiTopic] = useState("");
    const [aiProvider, setAiProvider] = useState("hackclub");
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [generatedQuiz, setGeneratedQuiz] = useState<any | null>(null);

    // For transferring AI output to form
    const [aiFormValues, setAiFormValues] = useState<any>(null);

    useEffect(() => {
        (async () => {
            const response = await fetch("/api/profile/self", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            if (!data.success) {
                alert("There was an error when trying to fetch user data, try logging in again: " + data.error);
                window.location.href = "/";
                return;
            }
            setUserData(data.user);
            
            // Load default provider from localStorage
            const savedProvider = localStorage.getItem('preferredAiProvider');
            if (savedProvider) {
                setAiProvider(savedProvider);
            }
        })();
    }, []);

    useEffect(() => {
        if (userData) {
            fetch(`/api/profile/self/lessons`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
                .then((res) => res.json())
                .then((data) => setUserLessonHierarchies(data.lessons || []))
                .catch((error) => {
                    console.error("Error fetching user lesson hierarchies:", error);
                });
        }
    }, [userData]);

    const handleAiGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setAiGenerating(true);
        setAiResult(null);
        setGeneratedQuiz(null);

        try {
            const response = await fetch("/api/ai/create/quiz", {
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

            if (response.ok && data.quiz) {
                // Try to parse the quiz if it's a JSON string
                let quizData;
                try {
                    quizData = typeof data.quiz === 'string' ? JSON.parse(data.quiz) : data.quiz;
                } catch {
                    quizData = data.quiz;
                }

                if (quizData.quizTitle && quizData.questions) {
                    setGeneratedQuiz(quizData);
                    setAiResult(JSON.stringify(quizData, null, 2));
                } else {
                    setAiResult(JSON.stringify(data.quiz, null, 2));
                }
            } else {
                setAiResult(`Error generating quiz: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error generating AI quiz:", error);
            setAiResult(`Error generating quiz: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
        } finally {
            setAiGenerating(false);
        }
    };

    const useGeneratedQuiz = () => {
        if (generatedQuiz) {
            document.getElementById('manual-quiz-form')?.scrollIntoView({ behavior: 'smooth' });

        }
    };

    const handleQuizSubmit = async (values: any) => {
        setSubmitting(true);
        try {
            const response = await fetch("/api/quizzes/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    nrOfQuestions: values.questions.length,
                    parentId: parentId || null,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setResult(JSON.stringify(data.quiz, null, 2));
                alert("Quiz created successfully!");
                window.location.href = "/app/quiz/" + data.quizId;
            } else {
                setResult("Error creating quiz: " + data.error);
                alert("Error creating quiz: " + data.error);
            }
        } catch (error) {
            setResult("Error creating quiz: " + (error as any)?.message);
            alert("Error creating quiz");
        }
        setSubmitting(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Header userData={userData} />
            
            {/* Manual Quiz Creation */}
            <div id="manual-quiz-form" className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Create a New Quiz</h1>
                    <p className="text-lg text-gray-600">
                        Create an interactive quiz with multiple choice questions and automatic grading.
                    </p>
                </div>
                
                <div className="mb-6">
                    <label htmlFor="parentLesson" className="block text-sm font-medium text-gray-700 mb-2">
                        Parent Lesson
                    </label>
                    <LessonSelect
                        lessons={userLessonHierarchies}
                        value={parentId}
                        onChange={(e: { target: { value: SetStateAction<string> } }) =>
                            setParentId(e.target.value)
                        }
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Select a parent lesson to attach this quiz, or leave empty for a root quiz
                    </p>
                </div>

                <QuizForm
                  onSubmit={handleQuizSubmit}
                  submitting={submitting}
                  quizTitle={null}
                  quizSynopsis={null}
                  questions={null}
                  initialValues={aiFormValues}
                />
                {result && (
                    <div className="mt-6">
                        <QuizFormResult result={result} onUseResult={undefined} />
                    </div>
                )}
            </div>

            {/* Section Divider */}
            <div className="flex items-center justify-center my-8">
                <div className="flex-grow border-t border-gray-300"></div>
                <div className="mx-4 bg-gray-50 px-4 py-2 rounded-full">
                    <span className="text-gray-500 font-medium">OR</span>
                </div>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* AI Quiz Generation Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        AI Quiz Generator
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Let AI create a comprehensive quiz for you on any topic. The AI will generate questions with multiple choice answers, explanations, and scoring.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-left">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Tip:</strong> Be specific with your quiz topic for better results. For example:
                                    <br />• "JavaScript ES6 Features and Syntax"
                                    <br />• "World War II Major Events and Dates"
                                    <br />• "Basic Algebra - Solving Linear Equations"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleAiGenerate} className="space-y-4">
                    <div>
                        <label htmlFor="aiTopic" className="block text-sm font-medium text-gray-700 mb-2">
                            Quiz Topic
                        </label>
                        <input
                            type="text"
                            id="aiTopic"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-3"
                            placeholder="Enter a quiz topic (e.g., 'Python Programming Basics', 'American History 1900-1950', 'Chemistry Periodic Table')"
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
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-3"
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
                        className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 font-medium"
                        disabled={aiGenerating || !aiTopic.trim()}
                    >
                        {aiGenerating ? "Generating Quiz..." : "Generate Quiz with AI"}
                    </button>
                </form>

                {aiGenerating && (
                    <div className="mt-6 text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-200 rounded-lg">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                            <span className="text-green-800">AI is generating your quiz...</span>
                        </div>
                    </div>
                )}

                {generatedQuiz && (
                    <div className="mt-6 space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Quiz Generated Successfully!</h3>
                            <p className="text-green-700 mb-2">
                                <strong>Title:</strong> {generatedQuiz.quizTitle}
                            </p>
                            <p className="text-green-700 mb-2">
                                <strong>Description:</strong> {generatedQuiz.quizSynopsis}
                            </p>
                            <p className="text-green-700 mb-4">
                                <strong>Questions:</strong> {generatedQuiz.questions?.length || 0} questions generated
                            </p>
                            {/* <button
                                type="button"
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                                onClick={useGeneratedQuiz}
                            >
                                View Quiz Data
                            </button> */}
                        </div>
                    </div>
                )}

                {aiResult && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Generated Content (JSON):</h3>
                        <QuizFormResult
                          result={aiResult}
                          onUseResult={(parsed: any) => {
                            // Accepts either a full quiz object or just questions
                            if (parsed && typeof parsed === "object") {
                              setAiFormValues({
                                quizTitle: parsed.quizTitle || "",
                                quizSynopsis: parsed.quizSynopsis || "",
                                questions: parsed.questions || [],
                              });
                            }
                            document.getElementById('manual-quiz-form')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
