"use client";
import { useState, useEffect, SetStateAction } from "react";

import Header from "@/components/Header"; // Assuming you have a Header component in your components directory
import MDEditor from "@uiw/react-md-editor";
import LessonSelect from "@/components/LessonSelect";

export default function Lesson() {
  // State to hold search query
  // const [searchQuery, setSearchQuery] = useState('');

  const [content, setContent] = useState("");

  const [userData, setUserData] = useState(null);

  const [userLessonHierarchies, setUserLessonHierarchies] = useState(null);
  const [parentId, setParentId] = useState("");
  
  // AI Lesson Generation state
  const [aiTopic, setAiTopic] = useState("");
  const [aiProvider, setAiProvider] = useState("hackclub");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [generatedLesson, setGeneratedLesson] = useState<{
    title: string;
    description: string;
    content: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      // Fetch user

      // get user from database
      const response = await fetch("/api/profile/self", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!data.success) {
        console.error(data.error);
        alert(
          "There was an error when trying to fetch user data, try logging in again: " +
            data.error
        );
        window.location.href = "/";
        return () => {};
      }
      if (data.success) {
        console.log(data);
        setUserData(data.user);
        
        // Load default provider from localStorage
        const savedProvider = localStorage.getItem('preferredAiProvider');
        if (savedProvider) {
          setAiProvider(savedProvider);
        }
        
        return () => {};
      }
    })();
  }, []);

  useEffect(() => {
    if (userData) {
      // Fetch user lesson hierarchies
      fetch(`/api/profile/self/lessons`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setUserLessonHierarchies(data.lessons || []);
        })
        .catch((error) => {
          console.error("Error fetching user lesson hierarchies:", error);
        });
    }
  }, [userData]);

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiGenerating(true);
    setAiResult(null);
    setGeneratedLesson(null);

    try {
      const response = await fetch("/api/ai/create/lesson", {
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

      if (response.ok && data.lesson) {
        // Try to parse the lesson if it's a JSON string
        let lessonData;
        try {
          lessonData = typeof data.lesson === 'string' ? JSON.parse(data.lesson) : data.lesson;
        } catch {
          lessonData = data.lesson;
        }

        if (lessonData.title && lessonData.description && lessonData.content) {
          setGeneratedLesson(lessonData);
          setAiResult(JSON.stringify(lessonData, null, 2));
        } else {
          setAiResult(JSON.stringify(data.lesson, null, 2));
        }
      } else {
        setAiResult(`Error generating lesson: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error generating AI lesson:", error);
      setAiResult(`Error generating lesson: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const useGeneratedLesson = () => {
    if (generatedLesson) {
      // Set the form fields with generated content
      const nameInput = document.getElementById('lessonName') as HTMLInputElement;
      const descriptionTextarea = document.getElementById('lessonDescription') as HTMLTextAreaElement;
      
      if (nameInput) nameInput.value = generatedLesson.title;
      if (descriptionTextarea) descriptionTextarea.value = generatedLesson.description;
      setContent(generatedLesson.content);
      
      // Scroll to the manual form
      document.getElementById('manual-lesson-form')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Header userData={userData} />
      
      {/* Manual Lesson Creation */}
      <div id="manual-lesson-form" className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create a New Lesson</h1>
          <p className="text-lg text-gray-600">
            Create a comprehensive lesson with structured content and learning objectives.
          </p>
        </div>
        
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const lessonContent = content;
            try {
              const response = await fetch("/api/lessons/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: (
                    form.elements.namedItem("lessonName") as HTMLInputElement
                  ).value,
                  description: (
                    form.elements.namedItem(
                      "lessonDescription"
                    ) as HTMLTextAreaElement
                  ).value,
                  content: lessonContent,
                  parentId: parentId || null,
                }),
              });
              const data = await response.json();
              if (data.success) {
                alert("Lesson created successfully!");
                window.location.href = "/app/lesson/" + data.lessonId;
              } else {
                alert("Error creating lesson: " + data.error);
              }
            } catch (error) {
              console.error("Error creating lesson:", error);
              alert("Error creating lesson");
            }
          }}
        >
          <div className="space-y-6">
            {/* Add parent lesson selector */}
            <div>
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
                Select a parent lesson to create a sub-lesson, or leave empty for a root lesson
              </p>
            </div>

            <div>
              <label htmlFor="lessonName" className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Name
              </label>
              <input
                type="text"
                id="lessonName"
                name="lessonName"
                placeholder="Name of the lesson"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                required
              />
            </div>
            
            <div>
              <label htmlFor="lessonDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Description
              </label>
              <textarea
                id="lessonDescription"
                name="lessonDescription"
                placeholder="Description of the lesson"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                rows={4}
                required
              />
            </div>
            
            <div>
              <label htmlFor="lessonContent" className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Content
              </label>
              <div className="border border-gray-300 rounded-md">
                <MDEditor
                  id="lessonContent"
                  height={400}
                  value={content}
                  onChange={(value) => setContent(value ?? "")}
                />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium text-lg">
            Create Lesson
          </button>
        </form>
      </div>

      {/* Section Divider */}
      <div className="flex items-center justify-center my-8">
        <div className="flex-grow border-t border-gray-300"></div>
        <div className="mx-4 bg-gray-50 px-4 py-2 rounded-full">
          <span className="text-gray-500 font-medium">OR</span>
        </div>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* AI Lesson Generation Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI Lesson Generator
          </h2>
          <p className="text-gray-600 mb-4">
            Let AI create a structured lesson for you on any topic. The AI will generate a complete lesson with title, description, and markdown content.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-left">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Tip:</strong> Be specific with your lesson topic for better results. For example:
                  <br />• "Introduction to Photosynthesis for High School Biology"
                  <br />• "JavaScript Functions and Scope for Beginners"
                  <br />• "The Causes of World War I - Historical Analysis"
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleAiGenerate} className="space-y-4">
          <div>
            <label htmlFor="aiTopic" className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Topic
            </label>
            <input
              type="text"
              id="aiTopic"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 p-3"
              placeholder="Enter a lesson topic (e.g., 'Introduction to Calculus', 'Spanish Grammar Basics', 'Climate Change Effects')"
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
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 p-3"
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
            {aiGenerating ? "Generating Lesson..." : "Generate Lesson with AI"}
          </button>
        </form>

        {aiGenerating && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 border border-purple-200 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              <span className="text-purple-800">AI is generating your lesson...</span>
            </div>
          </div>
        )}

        {generatedLesson && (
          <div className="mt-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Lesson Generated Successfully!</h3>
              <p className="text-green-700 mb-4">
                <strong>Title:</strong> {generatedLesson.title}
              </p>
              <p className="text-green-700 mb-4">
                <strong>Description:</strong> {generatedLesson.description}
              </p>
              <button
                type="button"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                onClick={useGeneratedLesson}
              >
                Use This Lesson in Form Above
              </button>
            </div>
          </div>
        )}

        {aiResult && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Generated Content (JSON):</h3>
            <div className="bg-blue-50 border border-blue-200 p-4 mx-4 rounded-lg">
              <pre className="mb-0 text-sm overflow-auto whitespace-pre-wrap">{aiResult}</pre>
            </div>
            <div className="mx-4 mt-3">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => navigator.clipboard.writeText(aiResult)}
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
