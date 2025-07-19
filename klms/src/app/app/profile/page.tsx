"use client";
// import { useRouter, } from 'next/router'
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

import Header from "@/components/Header";

type UserInfo = {
  username?: string;
  description?: string;
  [key: string]: any;
};

export default function Profile() {
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [userData, setUserData] = useState({ id: null});

  // useEffect to fetch data
  useEffect(() => {
    // Get session_id

    // Fetch data
    if (userData) {
        if(!userData.id) {
          console.error("User ID is not available");
            return;
        }
      fetch(`/api/profile/${userData.id}`, {
        headers: {
          "Content-Type": "application/json",
          // no cors
          mode: "no-cors",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setUserInfo(data);
          setLessons(data.lessons || []);
        })
        .catch((error) => {
          console.error("Error fetching profile data:", error);
        });
    }
  }, [userData]);

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
      <div className="mx-auto">
        <Header userData={userData} />

        <div className="flex flex-col items-center mt-8">
          <FontAwesomeIcon icon={faUser} className="text-4xl mb-2" />
          {userInfo ? (
            <>
              <h1 className="text-2xl font-bold">{userInfo.username}</h1>
              <p className="text-lg">{userInfo.description}</p>
            </>
          ) : (
            <div className="w-full h-12 bg-gray-300 animate-pulse"></div>
          )}
        </div>

        <br className="my-4" />

        <div className="flex flex-row justify-start bg-blue-200 rounded-lg p-4 mx-56">
          <main className="w-full">
            {lessons ? (
              lessons.length > 0 ? (
                lessons.map((lesson) => (
                  <article
                    key={lesson.id}
                    className="mb-4 bg-sky-950 rounded-lg p-4"
                  >
                    <h2 className="text-xl font-bold">{lesson.title}</h2>
                    <p>{lesson.description}</p>
                  </article>
                ))
              ) : (
                <div className="text-center p-4">
                  <h2 className="text-xl font-bold">No lessons found</h2>
                </div>
              )
            ) : (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="mb-4 bg-gray-300 rounded-lg p-4">
                  <div className="w-1/2 h-6 bg-gray-400 mb-2 animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-gray-400 animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-gray-400 animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-gray-400 animate-pulse"></div>
                </div>
              ))
            )}
          </main>
        </div>
      </div>
    </>
  );
}
