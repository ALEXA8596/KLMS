"use client";
import { useEffect, useState } from "react";

import ShareBar from "@/components/ShareBar";

import LessonTree from "@/components/LessonTree";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import Header from "@/components/Header";

import Markdown from "react-markdown";

interface LessonParams {
  lessonId: string;
}

export default function Lesson({ params }: { params: Promise<LessonParams> }) {
  // user id
  const [lessonId, setLessonId] = useState<string>("");
  interface UserType {
    id: string;
    // Add other user properties as needed
    [key: string]: any;
  }
  const [userData, setUserData] = useState<UserType | null>(null);
  // const [posts, setPosts] = useState(null);
  interface LessonType {
    id: string;
    name: string;
    content: string;
    creatorId: string;
    creatorName: string;
    // Add other properties as needed
  }

  const [lesson, setLesson] = useState<LessonType | null>(null);
  /**
   * An object with id, name, and children of the lesson, with the children being an array of lessons with id, name and children properties
   */
  const [lessonHierarchy, setLessonHierarchy] = useState(null);

  // Fetch lessonId from params using useEffect
  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setLessonId(resolvedParams.lessonId);
    })();
  }, [params]);

  useEffect(() => {
    if (lessonId) {
      // Fetch lesson data
      fetch(`/api/lessons/${lessonId}`)
        .then((res) => res.json())
        .then((data) => {
          setLesson(data.lesson || []);
        })
        .catch((error) => {
          console.error("Error fetching lesson data:", error);
        });

      // Fetch lesson tree hierarchy
      fetch(`/api/lesson/${lessonId}/tree`)
        .then((res) => res.json())
        .then((data) => {
          setLessonHierarchy(data.tree || []);
        })
        .catch((error) => {
          console.error("Error fetching lesson tree hierarchy:", error);
        });
    }
  }, [lessonId]);

  useEffect(() => {
    (async () => {
      // Fetch user

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
                currentLessonId={lessonId}
              />
            )}
          </div>
          {lesson ? (
            <div className="flex flex-row justify-start bg-blue-200 rounded-lg p-4 w-full">
              <div className="w-full">
                <h2 className="text-lg font-bold">{lesson.name}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Posted by {lesson.creatorName}
                </p>
                <p className="mb-4">
                  <Markdown>{lesson.content}</Markdown>
                </p>
                <ShareBar post={lesson}></ShareBar>
                {userData && lesson && userData.id === lesson.creatorId && (
                  <a
                    href={`/lesson/${lessonId}/edit`}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 inline-block"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-2" />
                    Edit Lesson
                  </a>
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
