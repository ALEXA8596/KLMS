import React, { useState } from "react";
import TopRightDropdown from "@/components/TopRightDropdown";
import CreateDropDown from "@/components/CreateDropdown";
import { signOut } from "@/auth";

export default function Header({ userData }) {
  const [searchQuery, setSearchQuery] = useState("");
  // const [userData, setUserData] = useState(null);
  return (
    <header className="d-flex justify-content-center p-4 relative">
      <div className="d-flex justify-content-between w-100">
        {/* Add a Home Button */}
        <a href="/home" className="d-flex align-items-center">
          <button>
            <img src="/hobbscussion.png" alt="Logo" className="w-32 m-auto" />
          </button>
        </a>

        

        <div className="relative my-auto">
          <CreateDropDown />
        </div>

        {/* Add a search bar */}
        <div className="d-flex m-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                window.location.href = `/search?query=${searchQuery}`;
              }
            }}
            className="form-control"
          />
          <button
            className="btn btn-primary ml-2"
            onClick={() => {
              console.log("Search query:", searchQuery);
              window.location.href = `/app/search?q=${searchQuery}`;
            }}
          >
            Search
          </button>
        </div>
        <div className="d-flex align-items-center">
          <div className="d-flex align-items-center mr-4">
            {userData && userData.avatar ? (
              <img
                src={userData.avatar}
                alt="User"
                className="rounded-circle"
                style={{ width: "32px", height: "32px" }}
              />
            ) : (
              <></>
            )}
            <span className="ml-2">
              {userData ? userData.username : "Placeholder"}
            </span>
          </div>
          <div className="relative">
            <TopRightDropdown
              signOut={() => {
                signOut();
                window.location.href = "/";
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
