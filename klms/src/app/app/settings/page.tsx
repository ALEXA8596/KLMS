"use client";
import { useState, useEffect, useRef } from "react";

import Header from "@/components/Header";

import User from "@/types/user";
/**
 * Settings Page Component
 */


export default function Settings() {
  const [userData, setUserData] = useState<User | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-2">Manage your account settings here.</p>
      </div>

      {/* User Information (email, username, id, timestampCreated) */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-4">
        {userData ? null : (
          <p className="text-red-500">Loading user data...</p>
        )}
        <h2 className="text-2xl font-bold">User Information</h2>
        <p className="mt-2">Email: {userData?.email}</p>
        <p>Username: {userData?.username}</p>
        <p>User ID: {userData?.id}</p>
        <p>
          Account Created:{" "}
          {userData?.timestampCreated
            ? new Date(userData.timestampCreated).toLocaleDateString()
            : "N/A"}
        </p>
      </div>

      {/* Password Change */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-4">
        <h2 className="text-2xl font-bold">Change Password</h2>
        <p className="mt-2">Update your account password here.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (newPassword !== confirmPassword) {
              alert("New password and confirmation do not match.");
              return;
            }

            fetch("/api/profile/self/change-password", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                oldPassword: oldPassword,
                newPassword: newPassword,
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success) {
                  alert("Password changed successfully.");
                } else {
                  alert("Error changing password: " + data.error);
                }
              });
          }}
        >
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
