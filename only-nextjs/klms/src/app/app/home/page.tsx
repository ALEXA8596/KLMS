"use client"
import { useState, useEffect, useRef, } from 'react';
const cookie = require('cookie');

import Header from '@/components/Header';

/**
 * Home Page Component
 */
export default function Home() {
    let cookies: { [key: string]: string } | null = null;
    
    useEffect(() => {
        cookies = cookie.parse(document.cookie);
    }, []);


    const [userData, setUserData] = useState(null);
    useEffect(() => {

        (async () => {
            // Fetch user

            // get cookie
            if (!cookies || !cookies.session_id) {
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

            {/* Add a Line Break */}
            <br className="my-4" />
        </div>
    );
}