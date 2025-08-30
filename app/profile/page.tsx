"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

type User = {
  name: string;
  email: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: string;
  description?: string;
  isNameVerified: boolean;
  isPhoneVerified: boolean;
  isAddressVerified: boolean;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    alert("Profile updated!");
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">No user found</p>;

  const allVerified =
    user.isNameVerified && user.isPhoneVerified && user.isAddressVerified;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg text-gray-900">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Image
            src={user.avatarUrl || "/default-avatar.png"}
            alt="Profile"
            width={80}
            height={80}
            className="rounded-full border"
          />
          {allVerified && (
            <span className="absolute bottom-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              ✓
            </span>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm">Phone Number</label>
          <input
            type="text"
            value={user.phoneNumber || ""}
            onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
          {user.isPhoneVerified ? (
            <span className="text-green-600 text-sm">✓ Verified</span>
          ) : (
            <button className="text-blue-500 text-sm">Verify</button>
          )}
        </div>

        <div>
          <label className="block text-sm">Address</label>
          <textarea
            value={user.address || ""}
            onChange={(e) => setUser({ ...user, address: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
          {user.isAddressVerified ? (
            <span className="text-green-600 text-sm">✓ Verified</span>
          ) : (
            <button className="text-blue-500 text-sm">Verify</button>
          )}
        </div>

        <div>
          <label className="block text-sm">Description</label>
          <textarea
            value={user.description || ""}
            onChange={(e) => setUser({ ...user, description: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-6 bg-[#00e2b7] hover:bg-[#00caa3] text-white px-4 py-2 rounded-xl"
      >
        Save Changes
      </button>
    </div>
  );
}