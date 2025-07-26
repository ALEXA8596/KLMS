"use client";
import { useState, useEffect, useRef } from "react";

import Header from "@/components/Header";

/**
 * Home Page Component
 */
export default function Home() {

  const [userData, setUserData] = useState(null);
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
        return () => {};
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Header userData={userData} />

        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Korean LMS
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Your comprehensive learning management system for creating, managing, and studying educational content
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/app/create/lesson" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200">
              Create Lesson
            </a>
            <a href="/app/create/flashcard" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-200">
              Create Flashcards
            </a>
            <a href="/app/create/quiz" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200">
              Create Quiz
            </a>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Lesson Creation */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Interactive Lessons</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Create comprehensive lessons with rich Markdown content, structured hierarchies, and learning objectives. Build nested lesson structures for organized curriculum delivery.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Markdown Editor</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Lesson Hierarchies</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">AI Generation</span>
            </div>
          </div>

          {/* Flashcard System */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Smart Flashcards</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Design interactive flashcards with front/back content and HTML compatibility. Perfect for vocabulary, concepts, and memorization-based learning.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Interactive Cards</span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Difficulty Levels</span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">AI Generation</span>
            </div>
          </div>

          {/* Quiz System */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Assessment Quizzes</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Build comprehensive quizzes with multiple choice questions, automatic grading, explanations, and detailed feedback to assess student understanding.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Auto Grading</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Explanations</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">AI Generation</span>
            </div>
          </div>

          {/* AI-Powered Content */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI Content Generation</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Leverage AI to automatically generate lessons, flashcards, and quizzes on any topic. Supports multiple AI providers including OpenAI, Anthropic, and Gemini.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">Multiple AI Providers</span>
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">Topic-based</span>
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">Customizable</span>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Profile & Settings</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage your profile, configure API keys for AI services, change passwords, and customize your learning experience with personalized settings.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Profile Management</span>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">API Key Setup</span>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Security</span>
            </div>
          </div>

          {/* Search & Discovery */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Search & Discovery</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Discover and search through lessons, flashcards, and quizzes. Find content created by you and others in the community to enhance your learning journey.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Content Search</span>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Community Content</span>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Filtering</span>
            </div>
          </div>

        </div>

        {/* Key Features Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Why Choose Korean LMS?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-lg mr-4 mt-1">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Creation</h4>
                <p className="text-gray-600">Generate high-quality educational content instantly with cutting-edge AI technology. Save time and create engaging materials effortlessly.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-lg mr-4 mt-1">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Organized Learning</h4>
                <p className="text-gray-600">Structure your content with hierarchical lessons, categorized flashcards, and organized quizzes for a seamless learning experience.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-purple-100 p-2 rounded-lg mr-4 mt-1">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h4>
                <p className="text-gray-600">Monitor learning progress with detailed analytics, quiz scores, and completion tracking to optimize your educational outcomes.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-lg mr-4 mt-1">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Flexible & Customizable</h4>
                <p className="text-gray-600">Adapt the platform to your needs with customizable settings, multiple AI providers, and flexible content creation options.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 opacity-90">
            Begin your learning journey today. Create your first lesson, flashcard set, or quiz in minutes.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/app/settings" className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition duration-200 font-semibold">
              Configure Settings
            </a>
            <a href="/app/search" className="bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition duration-200 font-semibold">
              Explore Content
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
