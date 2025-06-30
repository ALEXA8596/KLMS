"use client"
import { useState, useEffect, SetStateAction } from 'react';
const cookie = require('cookie');

import Header from '@/components/Header'; // Assuming you have a Header component in your components directory
import MDEditor from '@uiw/react-md-editor';
import LessonSelect from '@/components/LessonSelect';

export default function Quiz() {
    // State to hold search query
    // const [searchQuery, setSearchQuery] = useState('');
    const [cookies, setCookies] = useState<{ [key: string]: string } | null>(null);

    useEffect(() => {
        setCookies(cookie.parse(document.cookie));
        console.log(cookies);
    }, []);

    const [content, setContent] = useState('');

    const [userData, setUserData] = useState(null);

    const [userLessonHierarchies, setUserLessonHierarchies] = useState(null);
    const [parentId, setParentId] = useState('');

    useEffect(() => {

        (async () => {
            // Fetch user
            console.log(cookies);
            // get cookie
            if (cookies && !cookies.session_id) {
                console.log("No session_id cookie found")
                window.location.href = '/'
            }
            if (cookies && cookies.session_id) {
                console.log("Attempting Remember Me")
                var [id, dateCreated, hashedToken] = cookies.session_id.split('.');
                id = atob(id);
                dateCreated = atob(dateCreated);

                // get user from database
                const response = await fetch('http://localhost:9000/profile/self', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + (cookies?.session_id ?? ''),
                    },
                });

                const data = await response.json();
                if (!data.success) {
                    console.error(data.error);
                    alert("There was an error when trying to fetch user data, try logging in again: " + data.error);
                    window.location.href = '/'
                    return () => { };
                }
                if (data.success) {
                    console.log(data);
                    setUserData(data.user);
                    return () => { };
                }
            }
        })();
    }, [cookies]);

    useEffect(() => {
        if (userData) {
            // Fetch user lesson hierarchies
            if (!cookies || !cookies.session_id) {
                console.error('No session_id cookie found');
                return;
            }
            fetch(`http://localhost:9000/profile/self/lessons`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (cookies?.session_id ?? ''),
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    setUserLessonHierarchies(data.lessons || []);
                })
                .catch((error) => {
                    console.error('Error fetching user lesson hierarchies:', error);
                });
        }
    }, [userData]);

    // TODO This is currently just a lesson copy, change to quiz creation later
    return (
        <div className="container mx-auto">
            <Header userData={userData}/>
            <main>
                <h1>Create a New Quiz</h1>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const lessonContent = content;
                    try {
                        const response = await fetch('http://localhost:9000/lessons/create', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + (cookies?.session_id ?? ''),
                            },
                            body: JSON.stringify({ 
                                name: (form.elements.namedItem('lessonName') as HTMLInputElement).value,
                                description: (form.elements.namedItem('lessonDescription') as HTMLTextAreaElement).value,
                                content: lessonContent,
                                parentId: parentId || null,
                            }),
                        });
                        const data = await response.json();
                        if (data.success) {
                            alert('Lesson created successfully!');
                            window.location.href = '/lesson/' + data.lessonId;
                        } else {
                            alert('Error creating lesson: ' + data.error);
                        }
                    } catch (error) {
                        console.error('Error creating lesson:', error);
                        alert('Error creating lesson');
                    }
                }}>
                    <div className="form-group">
                        {/* Add parent lesson selector */}
                        <div className="mb-4">
                            <label htmlFor="parentLesson" className="h4">Parent Lesson</label>
                            <LessonSelect
                                lessons={userLessonHierarchies}
                                value={parentId}
                                onChange={(e: { target: { value: SetStateAction<string>; }; }) => setParentId(e.target.value)}
                            />
                            <small className="text-muted">
                                Select a parent lesson to create a sub-lesson, or leave empty for a root lesson
                            </small>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="lessonName" className="h4">Lesson Name</label>
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
                            <label htmlFor="lessonDescription" className="h4">Lesson Description</label>
                            <textarea
                                id="lessonDescription"
                                name="lessonDescription"
                                placeholder="Description of the lesson"
                                className="form-control border border-black"
                                rows={3}
                                required
                            />
                        </div>
                        <label htmlFor="lessonContent" className="h4">Lesson Content</label>
                        <MDEditor
                            id="lessonContent"
                            height={400}
                            className="border border-black"
                            value={content}
                            onChange={(value) => setContent(value ?? '')}
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