"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircle, AlertCircle } from "lucide-react";

type User = {
  name: string;
  email: string;
  avatarUrl?: string;
  phoneNumber?: string;
  countryCode?: string;
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

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500 animate-pulse">
        Loading profile...
      </p>
    );

  if (!user) return <p className="text-center mt-10">No user found</p>;

  const VerifiedBadge = ({ verified }: { verified: boolean }) =>
    verified ? (
      <span className="flex items-center gap-1 text-green-600 text-sm">
        <CheckCircle size={14} /> Verified
      </span>
    ) : (
      <span className="flex items-center gap-1 text-amber-500 text-sm">
        <AlertCircle size={14} /> Not Verified
      </span>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Profile header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#00e2b7] to-teal-600 p-6 text-white shadow-lg flex items-center gap-4">
        <div className="relative">
          <Image
            src={user.avatarUrl || "/default-avatar.png"}
            alt="Profile"
            width={80}
            height={80}
            className="rounded-full border-4 border-white"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-teal-100">{user.email}</p>
        </div>
      </div>

      {/* Phone number */}
      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-medium mb-2">Phone Number</label>
        <div className="flex gap-2">
          <select
            value={user.countryCode || "+91"}
            onChange={(e) => setUser({ ...user, countryCode: e.target.value })}
            className="border rounded-lg px-2 py-2"
          >
            <option value="+91">🇮🇳 +91</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+81">🇯🇵 +81</option>
          </select>
          <input
            type="text"
            value={user.phoneNumber || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setUser({ ...user, phoneNumber: val });
            }}
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="Enter phone number"
          />
        </div>
        <div className="mt-2">
          <VerifiedBadge verified={user.isPhoneVerified} />
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-medium mb-2">Address</label>
        <textarea
          value={user.address || ""}
          onChange={(e) => setUser({ ...user, address: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          rows={3}
        />
        <div className="mt-2">
          <VerifiedBadge verified={user.isAddressVerified} />
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl shadow p-4">
        <label className="block font-medium mb-2">Description</label>
        <textarea
          value={user.description || ""}
          onChange={(e) => setUser({ ...user, description: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          rows={3}
          placeholder="Tell something about yourself..."
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-[#00e2b7] to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition"
      >
        Save Changes
      </button>
    </div>
  );
}