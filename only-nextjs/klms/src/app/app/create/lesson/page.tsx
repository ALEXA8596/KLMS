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

  return (
    <div className="container mx-auto">
      <Header userData={userData} />
      <main>
        <h1>Create a New Lesson</h1>
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
          <div className="form-group">
            {/* Add parent lesson selector */}
            <div className="mb-4">
              <label htmlFor="parentLesson" className="h4">
                Parent Lesson
              </label>
              <LessonSelect
                lessons={userLessonHierarchies}
                value={parentId}
                onChange={(e: { target: { value: SetStateAction<string> } }) =>
                  setParentId(e.target.value)
                }
              />
              <small className="text-muted">
                Select a parent lesson to create a sub-lesson, or leave empty
                for a root lesson
              </small>
            </div>

            <div className="mb-4">
              <label htmlFor="lessonName" className="h4">
                Lesson Name
              </label>
              <input
                type="text"
                id="lessonName"
                name="lessonName"
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
          </div>
          <button type="submit" className="btn btn-primary btn-lg mt-3">
            Create Lesson
          </button>
        </form>

        <br />
      </main>
    </div>
  );
}
