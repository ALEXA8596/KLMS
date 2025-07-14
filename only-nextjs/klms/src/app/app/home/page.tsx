"use client";
import { useState, useEffect, useRef } from "react";
const cookie = require("cookie");

import Header from "@/components/Header";

/**
 * Home Page Component
 */
export default function Home() {

  const [userData, setUserData] = useState(null);
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
    <div className="container mx-auto">
      <Header userData={userData} />

      {/* Add a Line Break */}
      <br className="my-4" />
    </div>
  );
}
