"use client"
// import { useRouter, } from 'next/router'
import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon, } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
const cookie = require('cookie');


import Header from '@/components/Header';

type UserInfo = {
    username?: string;
    description?: string;
    [key: string]: any;
};

export default function Profile() {
    const [userInfo, setUserInfo] = useState<UserInfo>({});
    const [lessons, setLessons] = useState<any[]>([]);
    const [communities, setCommunities] = useState(null);

    let cookies: { [key: string]: string } | null = null;

    useEffect(() => {
        cookies = cookie.parse(document.cookie);
        if (cookies && cookies.session_id) {
            var [id, dateCreated, hashedToken] = cookies.session_id.split('.');
            id = atob(id);

            window.location.href = '/profile/' + id;
        }
    }, []);

    // useEffect to fetch data
    useEffect(() => {
        // Get session_id
        if (!cookies || !cookies.session_id) return;
        var [id, dateCreated, hashedToken] = cookies.session_id.split('.');
        id = atob(id);
        // Fetch data
        fetch(`http://localhost:9000/profile/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                // no cors
                'mode': 'no-cors',
                // authentication
                'authorization': 'Bearer ' + cookies.session_id,
            }
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setUserInfo(data);
                setLessons(data.lessons || []);
            })
            .catch((error) => {
                console.error('Error fetching profile data:', error);
            });
    }, [cookies]);
    const [userData, setUserData] = useState(null);
    useEffect(() => {

        (async () => {
            // Fetch user

            // get cookie
            if (!cookies || !cookies.session_id) {
                console.log("No session_id cookie found")
                window.location.href = '/'
                return;
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

            <div className="flex flex-col items-center mt-8">
                <FontAwesomeIcon icon={faUser} className="text-4xl mb-2" />
                {
                    userInfo ? (
                        <>
                            <h1 className="text-2xl font-bold">{userInfo.username}</h1>
                            <p className="text-lg">{userInfo.description}</p>
                        </>
                    ) : (
                        <div className="w-full h-12 bg-gray-300 animate-pulse"></div>
                    )
                }
            </div>

            <br className="my-4" />

            <div className="flex flex-row justify-start bg-blue-200 rounded-lg p-4 mx-56">
                <main className="w-full">
                    {
                        lessons ? (
                            lessons.length > 0 ? (
                                lessons.map((lesson) => (
                                    <article key={lesson.id} className="mb-4 bg-sky-950 rounded-lg p-4">
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
                        )
                    }
                </main>
            </div>
        </div>
    </>)
}