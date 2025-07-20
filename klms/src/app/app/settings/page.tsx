"use client";
import { useState, useEffect, useRef } from "react";

import Header from "@/components/Header";

import User from "@/types/user";

interface ApiKey {
  provider: string;
  key: string;
  userId?: string;
}

/**
 * Settings Page Component
 */

export default function Settings() {
  const [userData, setUserData] = useState<User | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newApiKeys, setNewApiKeys] = useState<ApiKey[]>([
    { provider: "", key: "" }
  ]);
  const [isUpdatingApiKeys, setIsUpdatingApiKeys] = useState(false);

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
        setApiKeys(data.user.apiKeys || []);
        return () => {};
      }
    })();
  }, []);

  const addNewApiKeyField = () => {
    setNewApiKeys([...newApiKeys, { provider: "", key: "" }]);
  };

  const removeApiKeyField = (index: number) => {
    if (newApiKeys.length > 1) {
      setNewApiKeys(newApiKeys.filter((_, i) => i !== index));
    }
  };

  const updateApiKeyField = (index: number, field: "provider" | "key", value: string) => {
    setNewApiKeys(newApiKeys.map((apiKey, i) => 
      i === index ? { ...apiKey, [field]: value } : apiKey
    ));
  };

  const submitApiKeys = async () => {
    setIsUpdatingApiKeys(true);
    
    try {
      // Filter out empty API keys
      const validApiKeys = newApiKeys.filter(apiKey => apiKey.provider && apiKey.key);
      
      if (validApiKeys.length === 0) {
        alert("Please add at least one valid API key.");
        setIsUpdatingApiKeys(false);
        return;
      }

      // Submit each API key to its respective endpoint
      const promises = validApiKeys.map(async (apiKey) => {
        const response = await fetch(`/api/profile/self/add-api-keys/${apiKey.provider.toLowerCase()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ apiKey: apiKey.key }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Failed to add ${apiKey.provider} API key: ${error.error}`);
        }

        return response.json();
      });

      await Promise.all(promises);
      
      // Refresh the user data to get updated API keys
      const response = await fetch("/api/profile/self", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setApiKeys(data.user.apiKeys || []);
        setNewApiKeys([{ provider: "", key: "" }]); // Reset the form
        alert("API keys saved successfully!");
      }
    } catch (error) {
      console.error("Error saving API keys:", error);
      alert(`Error saving API keys: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUpdatingApiKeys(false);
    }
  };

  const deleteApiKey = async (index: number) => {
    if (!confirm("Are you sure you want to delete this API key?")) {
      return;
    }

    try {
      const updatedApiKeys = apiKeys.filter((_, i) => i !== index);
      
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKeys: updatedApiKeys }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete API key");
      }

      setApiKeys(updatedApiKeys);
      alert("API key deleted successfully!");
    } catch (error) {
      console.error("Error deleting API key:", error);
      alert(`Error deleting API key: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

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
        {userData ? null : <p className="text-red-500">Loading user data...</p>}
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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1"
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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1"
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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 rounded"
          >
            Change Password
          </button>
        </form>
      </div>
      {/* API Keys Management */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-4">
        <h2 className="text-2xl font-bold">API Keys</h2>
        <p className="mt-2">Manage your API keys here.</p>
        
        {/* Existing API Keys */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-3">Current API Keys</h3>
          {apiKeys && apiKeys.length > 0 ? (
            <ul className="space-y-2">
              {apiKeys.map((key, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div>
                    <span className="font-semibold capitalize">{key.provider}:</span>{" "}
                    <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                      {key.key.substring(0, 8)}...{key.key.substring(key.key.length - 4)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    onClick={() => deleteApiKey(index)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No API keys found.</p>
          )}
        </div>

        {/* Add New API Keys */}
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold mb-3">Add New API Keys</h3>
          <div className="space-y-4">
            {newApiKeys.map((apiKey, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider
                  </label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    value={apiKey.provider}
                    onChange={(e) => updateApiKeyField(index, "provider", e.target.value)}
                  >
                    <option value="">Select Provider</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="gemini">Gemini</option>
                    <option value="xAI">xAI</option>
                  </select>
                </div>
                <div className="flex-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    placeholder="Enter API key"
                    value={apiKey.key}
                    onChange={(e) => updateApiKeyField(index, "key", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 disabled:bg-gray-400"
                  onClick={() => removeApiKeyField(index)}
                  disabled={newApiKeys.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              onClick={addNewApiKeyField}
            >
              Add Another API Key
            </button>
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              onClick={submitApiKeys}
              disabled={isUpdatingApiKeys}
            >
              {isUpdatingApiKeys ? "Saving..." : "Save API Keys"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
