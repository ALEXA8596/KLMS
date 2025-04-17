"use client"
import { useState, useEffect, useRef, } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
const cookie = require('cookie');

import createCommunity from '@/utils/createCommunity';
import Modal from '@/components/Modal';
import postToProfile from '@/utils/postToProfile';
import HeaderDropdown from '@/components/HeaderDropdown';
import Header from '@/components/Header';

/**
 * Home Page Component
 */
export default function Home() {

    // State to hold search query
    const [searchQuery, setSearchQuery] = useState('');
    let cookies;

    useEffect(() => {
        cookies = cookie.parse(document.cookie);
    }, []);

    // replace with courses and lessons
    // useEffect(() => {
    //     fetch('http://localhost:9000/home/communities', {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': 'Bearer ' + cookies.session_id,
    //         },
    //     })
    //         .then((res) => res.json())
    //         .then((data) => {
    //             setCommunities(data.communities || []);
    //         })
    //         .catch((error) => {
    //             console.error('Error fetching communities:', error);
    //         })
    // }, [cookies]);

    // useEffect(() => {
    //     // fetching posts
    //     fetch('http://localhost:9000/posts/popular', {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //     })
    //         .then((res) => res.json())
    //         .then((data) => {
    //             setPosts(data.posts || []);
    //         })
    //         .catch((error) => {
    //             console.error('Error fetching posts:', error);
    //         });
    // }, []);

    const [userData, setUserData] = useState(null);
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

    return (
        <div className="container mx-auto">
            <Header userData={userData} />

            <div className="d-flex justify-content-center"> {/* Add flex justify-center to center the form horizontally */}
                <form className="w-100 max-w-md" onSubmit={(e) => postToProfile({ e, document })}> {/* Adjust max-w-md as needed to control form width */}
                    <input name="title" type="text" placeholder="Title" className="form-control mb-4" />
                    <textarea name="content" placeholder="Content" className="form-control mb-4" rows="4"></textarea>
                    <button type="submit" className="btn btn-primary w-100">
                        Publish to your own profile
                    </button>
                </form>
            </div>

            {/* Add a Line Break */}
            <br className="my-4" />
        </div>
    );
}