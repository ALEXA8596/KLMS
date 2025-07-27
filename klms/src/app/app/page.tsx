"use client";
import { useState, useEffect, useRef } from "react";

import Header from "@/components/Header";

/**
 * Home Page Component
 */
export default function Home() {
  interface User {
    // Add user properties as needed
    id: string;
    // other properties...
  }
  
  interface Lesson {
    id: string;
    name: string;
    description: string;
  }
  
  interface Quiz {
    id: string;
    title: string;
    description: string;
  }
  
  interface Learn {
    id: string;
    title: string;
    description: string;
  }
  
  interface FlashcardSet {
    id: string;
    title: string;
    description: string;
  }

  const [userData, setUserData] = useState<User | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [learns, setLearns] = useState<Learn[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
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
        // window.location.href = '/'
        return () => {};
      }
      if (data.success) {
        console.log(data);
        setUserData(data.user);
        return () => {};
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!userData) return;

      const res = await fetch("/api/search/home", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await res.json();
      if (result.success) {
        setLessons(result.results.lessonResults || []);
        setQuizzes(result.results.quizResults || []);
        setLearns(result.results.learnResults || []);
        setFlashcardSets(result.results.flashcardResults || []);
      } else {
        console.error(result.error);
      }
    })();
  }, [userData]);

  return (
    <div className="container mx-auto">
      <Header userData={userData} />

      {/* Line Break */}
      <br className="my-4" />

      {/* Main Section */}

      <div className="flex flex-col gap-8 bg-blue-200 rounded-lg p-4 mx-20">
        {/* Lessons Row */}
        <section>
          <h2 className="text-lg font-bold mb-2">Lessons</h2>
          <div className="flex flex-row gap-4 overflow-x-auto">
            {lessons && lessons.length > 0
              ? lessons.map((lesson) => (
                  <article
                    key={lesson.id}
                    className="min-w-[220px] bg-sky-950 rounded-lg p-4 text-white"
                  >
                    <a href={`/lessons/${lesson.id}`}>
                      <h3 className="text-md font-semibold">{lesson.name}</h3>
                    </a>
                    <p className="text-sm">{lesson.description}</p>
                  </article>
                ))
              : Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="min-w-[220px] bg-gray-300 rounded-lg p-4"
                  >
                    <div className="w-1/2 h-6 bg-gray-400 mb-2 animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-gray-400 animate-pulse"></div>
                  </div>
                ))}
          </div>
        </section>

        {/* Quizzes Row */}
        <section>
          <h2 className="text-lg font-bold mb-2">Quizzes</h2>
          <div className="flex flex-row gap-4 overflow-x-auto">
            {quizzes && quizzes.length > 0
              ? quizzes.map((quiz) => (
                  <article
                    key={quiz.id}
                    className="min-w-[220px] bg-sky-950 rounded-lg p-4 text-white"
                  >
                    <a href={`/quizzes/${quiz.id}`}>
                      <h3 className="text-md font-semibold">{quiz.title}</h3>
                    </a>
                    <p className="text-sm">{quiz.description}</p>
                  </article>
                ))
              : Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="min-w-[220px] bg-gray-300 rounded-lg p-4"
                  >
                    <div className="w-1/2 h-6 bg-gray-400 mb-2 animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-gray-400 animate-pulse"></div>
                  </div>
                ))}
          </div>
        </section>

        {/* Learns Row
        <section>
          <h2 className="text-lg font-bold mb-2">Learning Modules</h2>
          <div className="flex flex-row gap-4 overflow-x-auto">
            {learns && learns.length > 0
              ? learns.map((learn) => (
                  <article
                    key={learn.id}
                    className="min-w-[220px] bg-sky-950 rounded-lg p-4 text-white"
                  >
                    <a href={`/learns/${learn.id}`}>
                      <h3 className="text-md font-semibold">{learn.title}</h3>
                    </a>
                    <p className="text-sm">{learn.description}</p>
                  </article>
                ))
              : Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="min-w-[220px] bg-gray-300 rounded-lg p-4"
                  >
                    <div className="w-1/2 h-6 bg-gray-400 mb-2 animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-gray-400 animate-pulse"></div>
                  </div>
                ))}
          </div>
        </section> */}

        {/* Flashcard Sets Row */}
        <section>
          <h2 className="text-lg font-bold mb-2">Flashcard Sets</h2>
          <div className="flex flex-row gap-4 overflow-x-auto">
            {flashcardSets && flashcardSets.length > 0
              ? flashcardSets.map((set) => (
                  <article
                    key={set.id}
                    className="min-w-[220px] bg-sky-950 rounded-lg p-4 text-white"
                  >
                    <a href={`/app/flashcard/${set.id}`}>
                      <h3 className="text-md font-semibold">{set.title}</h3>
                    </a>
                    <p className="text-sm">{set.description}</p>
                  </article>
                ))
              : Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="min-w-[220px] bg-gray-300 rounded-lg p-4"
                  >
                    <div className="w-1/2 h-6 bg-gray-400 mb-2 animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-gray-400 animate-pulse"></div>
                  </div>
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}
