"use client";
import { useState, useEffect, useRef } from "react";
const cookie = require("cookie");

import Header from "@/components/Header"; // Assuming you have a Header component in your components directory
import MDEditor from "@uiw/react-md-editor";

/**
 * Lesson Edit Page Component
 */
interface LessonPageProps {
  params: {
    lessonId: string;
  };
}

export default function Lesson({ params }: LessonPageProps) {
  // State to hold search query
  // const [searchQuery, setSearchQuery] = useState('');
  const { lessonId } = params;

  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  interface UserType {
    id: string;
    // Add other user properties as needed
    [key: string]: any;
  }

  const [userData, setUserData] = useState<UserType | null>(null);
  useEffect(() => {
    (async () => {
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

  interface LessonType {
    id: string;
    name: string;
    description: string;
    content: string;
    creatorId: string;
    // Add other properties as needed
  }

  const [lesson, setLesson] = useState<LessonType | null>(null);

  useEffect(() => {
    // Fetch data
    fetch(`/api/lessons/${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setLesson(data.lesson || []);
        setContent(data.lesson.content || "");
        setName(data.lesson.name || "");
        setDescription(data.lesson.description || "");
      })
      .catch((error) => {
        console.error("Error fetching post data:", error);
      });
  }, [lessonId]);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (lesson && userData) {
      if (lesson.creatorId === userData.id) {
        setLoaded(true);
      } else {
        window.location.href = "/lesson/" + lessonId;
      }
    }
  }, [lesson]);

  if (!loaded) {
    return (
      <div className="container mx-auto">
        <Header userData={userData} />
        <main>
          <h1>Loading...</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Header userData={userData} />
      <main>
        <h1>Edit Lesson</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const lessonContent = content;
            const form = e.target as HTMLFormElement;
            try {
              const response = await fetch("/api/lesson/" + lessonId, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: (
                    form.elements.namedItem("lessonName") as HTMLInputElement
                  )?.value,
                  description: (
                    form.elements.namedItem(
                      "lessonDescription"
                    ) as HTMLTextAreaElement
                  )?.value,
                  content: lessonContent,
                  changelog: (
                    form.elements.namedItem(
                      "lessonChangelog"
                    ) as HTMLTextAreaElement
                  )?.value,
                }),
              });
              const data = await response.json();
              if (data.success) {
                alert("Lesson edited successfully!");
                window.location.href = "/lesson/" + data.lessonId;
              } else {
                alert("Error editing lesson: " + data.error);
              }
            } catch (error) {
              console.error("Error editing lesson:", error);
              alert("Error editing lesson");
            }
          }}
        >
          <div className="form-group">
            <div className="mb-4">
              <label htmlFor="lessonName" className="h4">
                Lesson Name
              </label>
              <input
                type="text"
                id="lessonName"
                name="lessonName"
                defaultValue={name}
                placeholder="Name of the lesson"
                className="form-control border border-black"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="lessonDescription" className="h4">
                Lesson Description
              </label>
              <textarea
                id="lessonDescription"
                name="lessonDescription"
                defaultValue={description}
                placeholder="Description of the lesson"
                className="form-control border border-black"
                rows={3}
                required
              />
            </div>
            <label htmlFor="lessonContent" className="h4">
              Lesson Content
            </label>
            <MDEditor
              id="lessonContent"
              height={400}
              className="border border-black"
              value={content}
              onChange={(value) => setContent(value ?? "")}
            />
            {/* Add Changelog input */}
            <div className="mb-4 mt-3">
              <label htmlFor="lessonChangelog" className="h4">
                Changelog
              </label>
              <textarea
                id="lessonChangelog"
                name="lessonChangelog"
                placeholder="Changelog of the lesson"
                className="form-control border border-black"
                rows={3}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg mt-3">
            Save Lesson
          </button>
        </form>
      </main>
    </div>
  );
}
