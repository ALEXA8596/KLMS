"use client"
import { useEffect, useState, useRef } from 'react';
const cookie = require('cookie');
const { FontAwesomeIcon } = require('@fortawesome/react-fontawesome');
const { faUser, faCog, faSignOutAlt } = require('@fortawesome/free-solid-svg-icons');

import ShareBar from '@/components/ShareBar';

// import HeaderDropdown from '@/components/HeaderDropdown';

import Header from '@/components/Header';

import Markdown from 'react-markdown'

export default function Lesson({ params }) {

    // user id
    const { postId } = params;
    const [userData, setUserData] = useState(null);
    // const [posts, setPosts] = useState(null);
    const [post, setPost] = useState(null);

    let cookies;

    useEffect(() => {
        cookies = cookie.parse(document.cookie);
    }, []);
    // use useEffect to fetch post data & profile data
    useEffect(() => {
        // Fetch data
        fetch(`http://localhost:9000/api/lessons/${postId}`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data)
                setPost(data.post || []);
            })
            .catch((error) => {
                console.error('Error fetching post data:', error);
            });
    }, [postId]);

    useEffect(() => {

        (async () => {
            // Fetch user

            // get cookie
            if (!cookies.session_id) {
                console.log("No session_id cookie found")
                window.location.href = '/'
            }
            if (cookies.session_id) {
                console.log("Attempting Remember Me")
                var [id, dateCreated, hashedToken] = cookies.session_id.split('.');
                id = atob(id);
                dateCreated = atob(dateCreated);

                // get user from database
                const response = await fetch('http://localhost:9000/profile/self', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + cookies.session_id,
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

    return (<>
        <div className="mx-auto">
            <Header userData={userData} />

            {/* <div className="flex flex-col items-center mt-8">
                <FontAwesomeIcon icon={faUser} className="text-4xl mb-2" />
                {
                    community ? (
                        <h1 className="text-2xl font-bold">{community.name}</h1>
                    ) : (
                        <div className="w-full h-12 bg-gray-300 animate-pulse"></div>
                    )
                }
            </div> */}

            {/* Add a Line Break */}
            {/* <br className="my-4" /> */}

            {/* The Actual Post */}

            {
                post ? (
                    <div className="flex flex-row justify-start bg-blue-200 rounded-lg p-4 mx-56">
                        <div className="w-full">
                            <h2 className="text-lg font-bold">{post.name}</h2>
                            <p className="text-sm text-gray-500 mb-4">Posted by {post.creatorName}</p>
                            <p className="mb-4"><Markdown>{post.content}</Markdown></p>
                            <ShareBar post={post}></ShareBar>
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
                )
            }
            <br className="my-4" />
            {/* <div className="flex flex-row justify-start bg-blue-200 rounded-lg p-4 mx-56">

                <main className="w-full">
                    <h2 className="text-lg font-bold mb-4">More posts from this user</h2>
                    {
                        posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <article key={post.id} className="mb-4 bg-sky-950 rounded-lg p-4">
                                    <a href={`/profile/${post.author}/posts/${post.id}`} className='hover:underline'>
                                        <h2 className="text-xl font-bold" >{post.title}</h2>
                                    </a>
                                    <p>{post.content}</p>
                                </article>
                            ))
                        ) : (
                            Array.from({ length: 5 }).map((_, index) => ( // Assuming you want 5 placeholders
                                <div key={index} className="mb-4 bg-gray-300 rounded-lg p-4 h-24 animate-pulse"></div>
                            ))
                        )
                    }
                </main>
            </div> */}
        </div>
    </>)
}