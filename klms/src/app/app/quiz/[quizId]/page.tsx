"use client";
import React, { useEffect, useState, useRef } from "react";

import ShareBar from "@/components/ShareBar";

import LessonTree from "@/components/LessonTree";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import Header from "@/components/Header";

import Quiz from "@/components/Quiz/Quiz"

interface QuizParams {
  quizId: string;
}

export default function QuizPage({ params }: { params: Promise<QuizParams> }) {
  const [quiz, setQuiz] = useState<any | null>(null);
  const [userData, setUserData] = useState<UserType | null>(null);
  /**
   * An object with id, name, and children of the lesson, with the children being an array of lessons with id, name and children properties
   */
  const [lessonHierarchy, setLessonHierarchy] = useState(null);
  // user id

  const [quizId, setQuizId] = useState<string>("");

  interface UserType {
    id: string;
    // Add other user properties as needed
    [key: string]: any;
  }

  // Fetch quizId from params using useEffect
  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setQuizId(resolvedParams.quizId);
    })();
  }, [params]);

  useEffect(() => {
    if (quizId) {
      // Fetch quiz data
      fetch(`/api/quizzes/${quizId}`)
        .then((res) => res.json())
        .then((data) => {
          setQuiz(data.quiz || null);
        })
        .catch((error) => {
          console.error("Error fetching quiz data:", error);
        });

      // Fetch quiz tree hierarchy
      fetch(`/api/quiz/${quizId}/tree`)
        .then((res) => res.json())
        .then((data) => {
          setLessonHierarchy(data.tree || []);
        })
        .catch((error) => {
          console.error("Error fetching quiz tree hierarchy:", error);
        });
    }
  }, [quizId]);

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
    <>
      <div className="container mx-auto">
        <Header userData={userData} />

        <div className="flex gap-4 px-4">
          <div className="w-1/4">
            {lessonHierarchy && (
              <LessonTree
                hierarchy={lessonHierarchy}
                currentLessonId={quizId}
              />
            )}
          </div>
          {quiz ? (
            <div className="flex flex-row justify-start bg-blue-200 rounded-lg p-4 w-full">
              <div className="w-full">
                {quiz && (
                  <Quiz
                    quiz={{ ...quiz, progressBarColor: "#4f46e5", }} shuffle={undefined} shuffleAnswer={undefined} showDefaultResult={undefined} onComplete={undefined} customResultPage={undefined} showInstantFeedback={undefined} continueTillCorrect={undefined} revealAnswerOnSubmit={undefined} allowNavigation={undefined} onQuestionSubmit={undefined} disableSynopsis={undefined} timer={undefined} allowPauseTimer={undefined} enableProgressBar={undefined}                    
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-row justify-start bg-blue-200 rounded-lg p-4 mx-40">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded bg-gray-300 h-6 w-3/4"></div>
                <div className="rounded bg-gray-300 h-6 w-1/4"></div>
              </div>
              <div className="mt-2 animate-pulse flex space-x-4">
                <div className="rounded bg-gray-300 h-4 w-1/3"></div>
              </div>
              <div className="mt-2 animate-pulse">
                <div className="rounded bg-gray-300 h-4 w-full"></div>
                <div className="rounded bg-gray-300 h-4 w-full mt-2"></div>
                <div className="rounded bg-gray-300 h-4 w-5/6 mt-2"></div>
              </div>
            </div>
          )}
          <br className="my-4" />
        </div>
      </div>
    </>
  );
}
