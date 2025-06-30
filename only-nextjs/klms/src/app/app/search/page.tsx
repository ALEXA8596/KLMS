"use client";
import { useState, useEffect, Suspense, SetStateAction } from "react";
const cookie = require("cookie");
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";

/**
 * Home Page Component
 */
export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  type SearchResults = {
    users: Array<any>;
    lessons: Array<any>;
    [key: string]: Array<any>;
  } | null;

  const [searchResults, setSearchResults] = useState<SearchResults>(null);
  const query = searchParams.get("q");
  // State to hold search query
  let cookies: { [key: string]: string } | null = null;

  useEffect(() => {
    cookies = cookie.parse(document.cookie);
  }, []);

  useEffect(() => {
    fetch(`http://localhost:9000/search?q=${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (cookies?.session_id ?? ""),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.results);
        setSearchResults(data.results || []);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  }, [cookies]);

  const [userData, setUserData] = useState(null);
  useEffect(() => {
    (async () => {
      // Fetch user
      if(!cookies) return

      // get cookie
      if (!cookies.session_id) {
        console.log("No session_id cookie found");
        window.location.href = "/";
      }
      if (cookies.session_id) {
        console.log("Attempting Remember Me");
        var [id, dateCreated, hashedToken] = cookies.session_id.split(".");
        id = atob(id);
        dateCreated = atob(dateCreated);

        // get user from database
        const response = await fetch("http://localhost:9000/profile/self", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + cookies.session_id,
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
      }
    })();
  }, [cookies]);

  const [searchType, setSearchType] = useState("lessons"); // Default to 'communities'

  const handleChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSearchType(event.target.value);
  };

  return (
    <div className=" mx-auto">
      <Header userData={userData} />

      {/* Add a Line Break */}
      <br className="my-4" />

      {/* Create a Radio to switch between communities, users, and posts */}
      <div className="flex justify-center">
        <input
          type="radio"
          id="users"
          name="searchType"
          value="users"
          disabled={searchResults === null} // Disable radio if no search results
          checked={searchType === "users"} // Bind state to radio
          onChange={handleChange} // Handle change
        />
        <label htmlFor="users" className="mx-2">
          Users
        </label>

        <input
          type="radio"
          id="lessons"
          name="searchType"
          value="lessons"
          disabled={searchResults === null} // Disable radio if no search results
          checked={searchType === "lessons"} // Bind state to radio
          onChange={handleChange} // Handle change
        />
        <label htmlFor="lessons" className="mx-2">
          Lessons
        </label>
      </div>
      {/* Add a Main Section */}

      <div className="flex flex-row justify-start bg-blue-200 rounded-lg p-4 mx-56">
        <main className="w-full">
          {searchResults ? (
            searchResults[searchType].length > 0 ? (
              searchResults[searchType].slice(0, 10).map((post) => {
                if (searchType === "users") {
                  return (
                    <a key={post.id} href={`/profile/${post.id}`}>
                      <article className="mb-4 bg-sky-950 rounded-lg p-4">
                        <h2 className="text-xl font-bold">{post.username}</h2>
                      </article>
                    </a>
                  );
                }
                if (searchType === "lessons") {
                  return (
                    <a key={post.id} href={`/lesson/${post.id}`}>
                      <article className="mb-4 bg-sky-950 rounded-lg p-4">
                        <h2 className="text-xl font-bold">{post.name}</h2>
                        <p>{post.description}</p>
                      </article>
                    </a>
                  );
                }
              })
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-bold">No results found</h2>
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
          )}
        </main>
      </div>
    </div>
  );
}
