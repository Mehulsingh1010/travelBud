// components/FieldEditorModal.tsx
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

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

export default function FieldEditorModal({
  field,
  onClose,
  user,
  onSave,
  countryCodes,
  onPickAvatar,
}: {
  field: "name" | "email" | "phone" | "countryCode" | "address" | "description" | "avatar";
  onClose: () => void;
  user: User;
  onSave: (field: string, newVal: string) => void;
  countryCodes: { code: string; label: string; emoji?: string }[];
  onPickAvatar: (file: File) => void;
}) {
  // initial values by field
  const initial =
    field === "name"
      ? user.name || ""
      : field === "email"
      ? user.email || ""
      : field === "phone"
      ? user.phoneNumber || ""
      : field === "countryCode"
      ? user.countryCode || ""
      : field === "address"
      ? user.address || ""
      : field === "description"
      ? user.description || ""
      : "";

  const [val, setVal] = useState(initial);
  const [countryCode, setCountryCode] = useState(user.countryCode || countryCodes[0]?.code || "+1");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVal(initial);
    setCountryCode(user.countryCode || countryCodes[0]?.code || "+1");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field]);

  // phone validation: exactly 10 digits
  const validatePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "Phone required";
    if (!/^\d{10}$/.test(digits)) return "Phone must be exactly 10 digits";
    return "";
  };

  const handleSave = () => {
    if (field === "phone") {
      const err = validatePhone(val);
      if (err) {
        setError(err);
        return;
      }
      // merge countryCode + digits as separate values handled by parent:
      // we'll call onSave twice: one for countryCode and one for phone.
      // First update countryCode locally via onSave("countryCode"...), then call onSave("phone"...).
      onSave("countryCode", countryCode);
      onSave("phone", val.replace(/\D/g, ""));
      return;
    }

    // simple email/name/address/description save
    onSave(field, val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-60 w-full max-w-md bg-white rounded-2xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {field === "name" && "Edit full name"}
            {field === "email" && "Edit email"}
            {field === "phone" && "Edit phone"}
            {field === "countryCode" && "Choose country code"}
            {field === "address" && "Edit address"}
            {field === "description" && "Edit about"}
            {field === "avatar" && "Edit profile picture"}
          </h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="mt-3">
          {field === "avatar" ? (
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border bg-slate-100">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt="avatar" fill sizes="96px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">No</div>
                )}
              </div>

              <div>
                <label htmlFor="avatar-input-modal" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 cursor-pointer">
                  Upload new
                </label>
                <input
                  id="avatar-input-modal"
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onPickAvatar(f);
                  }}
                />
                <div className="mt-2 text-sm text-slate-500">Choose image and Save on main page to persist.</div>
              </div>
            </div>
          ) : field === "countryCode" ? (
            <div className="max-h-60 overflow-auto">
              {countryCodes.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    onSave("countryCode", c.code);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-md flex items-center gap-3"
                >
                  <span className="text-lg">{c.emoji ?? "🌐"}</span>
                  <div>
                    <div className="font-medium">{c.label}</div>
                    <div className="text-sm text-slate-500">{c.code}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : field === "address" || field === "description" ? (
            <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={4} className="w-full border rounded-lg px-3 py-2" />
          ) : field === "phone" ? (
            <>
              <div className="flex gap-2 items-start">
                <div className="w-36">
                  <label className="block text-xs text-slate-500">Country code</label>
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="w-full border rounded-lg px-2 py-2">
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.emoji ? `${c.emoji} ${c.code}` : c.code} — {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-xs text-slate-500">Phone (10 digits)</label>
                  <input
                    value={val}
                    onChange={(e) => {
                      const raw = e.target.value;
                      // allow only digits in the input display
                      const digits = raw.replace(/\D/g, "");
                      setVal(digits);
                      if (error) {
                        const maybe = validatePhoneQuick(digits);
                        if (!maybe) setError(null);
                      }
                    }}
                    type="tel"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter 10 digits"
                  />
                </div>
              </div>

              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </>
          ) : (
            <input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              type={field === "email" ? "email" : "text"}
              className="w-full border rounded-lg px-3 py-2"
            />
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-xl bg-slate-100">
            Cancel
          </button>

          {/* For countryCode we save via chooser; for avatar handled separately */}
          {field !== "countryCode" && field !== "avatar" && (
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00e2b7] to-teal-600 text-white font-semibold"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // quick inline validator used in onChange
  function validatePhoneQuick(digits: string) {
    if (!digits) return "Phone required";
    if (!/^\d{10}$/.test(digits)) return "Phone must be exactly 10 digits";
    return "";
  }
}