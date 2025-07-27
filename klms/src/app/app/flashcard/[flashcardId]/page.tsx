"use client";
import React, { useEffect, useState, useRef } from "react";

import ShareBar from "@/components/ShareBar";

import LessonTree from "@/components/LessonTree";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import Header from "@/components/Header";

import { FlashcardArray } from "@/components/FlashCards/index";

interface FlashcardParams {
  flashcardId: string;
}

export default function FlashcardPage({
  params,
}: {
  params: Promise<FlashcardParams>;
}) {
  const [flashcard, setFlashcard] = useState<any | null>(null);
  const [userData, setUserData] = useState<UserType | null>(null);
  /**
   * An object with id, title, and children of the lesson, with the children being an array of lessons with id, title and children properties
   */
  const [lessonHierarchy, setLessonHierarchy] = useState(null);
  // user id
  // Unwrap params if it's a promise (Next.js App Router)
  // @ts-ignore
  const { flashcardId } =
    typeof params.then === "function" ? React.use(params) : params;

  interface UserType {
    id: string;
    // Add other user properties as needed
    [key: string]: any;
  }

  // const [posts, setPosts] = useState(null);

  // use useEffect to fetch post data & profile data

  useEffect(() => {
    fetch(`/api/flashcards/${flashcardId}`)
      .then((res) => res.json())
      .then((data) => {
        // Expecting data.flashcard to be in flashcard format
        console.log(data);
        data.flashcardSet.cards = data.flashcardSet.cards.map((card: any, index: number) => {
          card.front.html = `${card.front.html}`;
          card.back.html = `${card.back.html}`;
          card.frontHTML = card.front.html;
          card.backHTML = card.back.html;
          delete card.difficulty;
          delete card.hint;
          return { ...card };
        });
        console.log(data.flashcardSet.cards);
        setFlashcard(data.flashcardSet);
        // console.log(data.flashcardSet);
        // console.log(flashcard.cards);
        console.log(flashcard)
      })
      .catch((error) => {
        console.error("Error fetching flashcard data:", error);
      });
  }, [flashcardId]);

  useEffect(() => {
    // Fetch data
    fetch(`/api/flashcard/${flashcardId}/tree`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setLessonHierarchy(data.tree || []);
      })
      .catch((error) => {
        console.error("Error fetching flashcard tree hierarchy:", error);
      });

    console.log(lessonHierarchy);
  }, [flashcard]);

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
          {/* <div className="w-1/4">
            {lessonHierarchy && (
              <LessonTree
                hierarchy={lessonHierarchy}
                currentLessonId={flashcardId}
              />
            )}
          </div> */}
          {flashcard ? (
            <div className="flex flex-row justify-start bg-green-200 rounded-lg p-4 w-full">
              <div className="w-full">
                <h1 className="text-2xl font-bold mb-4">{flashcard.title}</h1>
                {flashcard.description && (
                  <p className="text-gray-700 mb-6">{flashcard.description}</p>
                )}

                <div className="">
                  {flashcard.cards.length ? <FlashcardArray deck={flashcard.cards}/> : <p>No flashcards available</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-row justify-start bg-green-200 rounded-lg p-4 mx-40">
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
