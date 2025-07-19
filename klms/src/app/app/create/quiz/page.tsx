"use client";
import { useState, useEffect, SetStateAction } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import LessonSelect from "@/components/LessonSelect";

// Dynamically import QuizForm and QuizFormResult to avoid SSR issues with redux-form
const QuizForm = dynamic(() => import("@/components/QuizForm"), { ssr: false });
const QuizFormResult = dynamic(() => import("@/components/QuizFormResult"), { ssr: false });

export default function Quiz() {
    const [userData, setUserData] = useState<any>(null);
    const [userLessonHierarchies, setUserLessonHierarchies] = useState<any>(null);
    const [parentId, setParentId] = useState<string>("");
    const [result, setResult] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

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
        <div className="container mx-auto">
            <Header userData={userData} />
            <main>
                <h1>Create a New Quiz</h1>
                <div className="form-group">
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
                            Select a parent lesson to attach this quiz, or leave empty for a root quiz
                        </small>
                    </div>
                </div>
                <QuizForm onSubmit={handleQuizSubmit} submitting={submitting} />
                {result && <QuizFormResult result={result} />}
                <br />
            </main>
        </div>
    );
}
