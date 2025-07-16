"use client";
import { useEffect, useState } from 'react';

import Header from '@/components/Header';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
interface ProfilePageProps {
    params: {
        userId: string;
    };
}

export default function Profile({ params }: ProfilePageProps) {
    const [userInfo, setUserInfo] = useState<UserInfo>({});
    const [posts, setPosts] = useState<any[]>([]);

    // user id
    const { userId: id } = params;
    interface UserInfo {
        username?: string;
        description?: string;
        posts?: any[];
        [key: string]: any;
    }


    // useEffect to fetch data
    useEffect(() => {
        // Fetch data
        fetch(`/api/profile/${id}`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data)
                setUserInfo(data.user);
                setPosts(data.user.posts || []);
            })
            .catch((error) => {
                console.error('Error fetching community data:', error);
            });
    }, [id]);

    const [userData, setUserData] = useState(null);
    useEffect(() => {

        (async () => {
            // Fetch user
                // get user from database
                const response = await fetch('/api/profile/self', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
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
            
        })();
    }, []);

    return (<>
        <div className="mx-auto">
            <Header userData={userData} />


            


            <div className="flex flex-col items-center mt-8">
                <FontAwesomeIcon icon={faUser} className="text-4xl mb-2" />
                {
                    userInfo ? (
                        <>
                            <h1 className="text-2xl font-bold">{userInfo.username}</h1>
                            <p className="text-lg">{userInfo.description}</p> {/* Placeholder for user description */}
                        </>
                    ) : (
                        <div className="w-full h-12 bg-gray-300 animate-pulse"></div>
                    )
                }
            </div>

            {/* Add a Line Break */}
            <br className="my-4" />

            {/* Add a Main Section */}

            <div className="flex flex-row justify-start bg-blue-200 rounded-lg p-4 mx-40">
                <main className="w-full">
                    {
                        posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <article key={post.id} className="mb-4 bg-sky-950 rounded-lg p-4">
                                    <h2 className="text-xl font-bold">{post.title}</h2>
                                    <p>{post.content}</p>
                                </article>
                            ))
                        ) : (
                            Array.from({ length: 5 }).map((_, index) => ( // Assuming you want 5 placeholders
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