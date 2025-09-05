// app/profile/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ProfileFieldCard from "@/components/profile/ProfileFieldCard";
import FieldEditorModal from "@/components/profile/FieldEditorModal";
import SosModal from "@/components/profile/SosModal";
import { countryCodes } from "@/lib/countryCodes";
import Image from "next/image";
import { Trash2, Camera } from "lucide-react";

type PhoneObj = { countryCode: string; number: string };

type User = {
  name: string;
  email: string;
  avatarUrl?: string | null;
  phoneNumber?: string; // digits only
  countryCode?: string; // e.g. "+91"
  address?: string;
  description?: string;
  sosPhoneNumbers?: PhoneObj[]; // up to 5
  sosEmails?: string[]; // up to 5
  isNameVerified: boolean;
  isPhoneVerified: boolean;
  isAddressVerified: boolean;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // modal editor state: which field is being edited
  const [editingField, setEditingField] = useState<
    null | "name" | "email" | "phone" | "countryCode" | "address" | "description" | "avatar"
  >(null);

  // SOS modal open state
  const [showSosModal, setShowSosModal] = useState(false);

  // avatar menu state & refs
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Load user on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/user")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        return data;
      })
      .then((data: any) => {
        if (!mounted) return;
        // server returned row directly (or { user })
        const row = data.user ?? data;

        // Parse/normalize SOS fields into desired shapes
        const parsedPhones: PhoneObj[] = (() => {
          const v = row.sosPhoneNumbers ?? row.sos_phone_numbers ?? null;
          if (!v) return [];
          if (typeof v === "string") {
            try {
              const parsed = JSON.parse(v);
              if (Array.isArray(parsed)) {
                return parsed.map((it: any) => (typeof it === "string" ? { countryCode: row.countryCode ?? "+91", number: String(it) } : it));
              }
              return [];
            } catch {
              return [];
            }
          }
          if (Array.isArray(v)) {
            return v.map((it: any) => (typeof it === "string" ? { countryCode: row.countryCode ?? "+91", number: String(it) } : it));
          }
          return [];
        })();

        const parsedEmails: string[] = (() => {
          const v = row.sosEmails ?? row.sos_emails ?? null;
          if (!v) return [];
          if (typeof v === "string") {
            try {
              const parsed = JSON.parse(v);
              return Array.isArray(parsed) ? parsed.map(String) : [];
            } catch {
              return [];
            }
          }
          if (Array.isArray(v)) return v.map(String);
          return [];
        })();

        const normalized: User = {
          name: row.name,
          email: row.email,
          avatarUrl: row.avatarUrl ?? row.avatar_url ?? null,
          phoneNumber: row.phoneNumber ?? row.phone_number ?? undefined,
          countryCode: row.countryCode ?? row.country_code ?? undefined,
          address: row.address ?? undefined,
          description: row.description ?? undefined,
          sosPhoneNumbers: parsedPhones,
          sosEmails: parsedEmails,
          isNameVerified: !!row.isNameVerified,
          isPhoneVerified: !!row.isPhoneVerified,
          isAddressVerified: !!row.isAddressVerified,
        };

        setUser(normalized);
        setOriginalUser(normalized);
      })
      .catch((err) => {
        console.error(err);
        setMessage({ type: "error", text: "Failed to load profile." });
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // initial load

  // close avatar menu on outside click or Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!showAvatarMenu) return;
      if (!avatarMenuRef.current) return;
      if (e.target instanceof Node && !avatarMenuRef.current.contains(e.target)) {
        setShowAvatarMenu(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowAvatarMenu(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showAvatarMenu]);

  // compute if anything changed (shallow compare)
  const hasChanges = useMemo(() => {
    if (!user || !originalUser) return false;
    const keys: (keyof User)[] = [
      "name",
      "email",
      "avatarUrl",
      "phoneNumber",
      "countryCode",
      "address",
      "description",
      "sosPhoneNumbers",
      "sosEmails",
      "isNameVerified",
      "isPhoneVerified",
      "isAddressVerified",
    ];
    // compare sos arrays by JSON string
    return (
      keys.some((k) => {
        const a = (user as any)[k];
        const b = (originalUser as any)[k];
        if (Array.isArray(a) || Array.isArray(b)) {
          return JSON.stringify(a || []) !== JSON.stringify(b || []);
        }
        return a !== b;
      }) || !!avatarFile
    );
  }, [user, originalUser, avatarFile]);

  // safe initials for avatar fallback
  const initials = useMemo(() => {
    if (!user?.name) return "";
    return user.name
      .split(" ")
      .map((p) => (p && p[0]) || "")
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user]);

  // handle avatar pick (click avatar to pick)
  const onAvatarPicked = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarFile(file);
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarPreviewUrl(url);
    setUser((u) => (u ? { ...u, avatarUrl: url } : u));
  };

  // delete avatar (server-supported via { removeAvatar: true } JSON)
  const handleDeleteAvatar = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeAvatar: true }),
      });
      if (!res.ok) throw new Error("Delete failed");
      const payload = await res.json();
      const updatedRaw = payload.user ?? payload;

      // normalize returned row
      const parsedPhones: PhoneObj[] = (() => {
        const v = updatedRaw.sosPhoneNumbers ?? updatedRaw.sos_phone_numbers ?? null;
        if (!v) return [];
        if (typeof v === "string") {
          try {
            const parsed = JSON.parse(v);
            if (Array.isArray(parsed)) {
              return parsed.map((it: any) => (typeof it === "string" ? { countryCode: updatedRaw.countryCode ?? "+91", number: String(it) } : it));
            }
            return [];
          } catch {
            return [];
          }
        }
        if (Array.isArray(v)) {
          return v.map((it: any) => (typeof it === "string" ? { countryCode: updatedRaw.countryCode ?? "+91", number: String(it) } : it));
        }
        return [];
      })();

      const parsedEmails: string[] = (() => {
        const v = updatedRaw.sosEmails ?? updatedRaw.sos_emails ?? null;
        if (!v) return [];
        if (typeof v === "string") {
          try {
            const parsed = JSON.parse(v);
            return Array.isArray(parsed) ? parsed.map(String) : [];
          } catch {
            return [];
          }
        }
        if (Array.isArray(v)) return v.map(String);
        return [];
      })();

      const updated: User = {
        name: updatedRaw.name,
        email: updatedRaw.email,
        avatarUrl: updatedRaw.avatarUrl ?? updatedRaw.avatar_url ?? null,
        phoneNumber: updatedRaw.phoneNumber ?? updatedRaw.phone_number ?? undefined,
        countryCode: updatedRaw.countryCode ?? updatedRaw.country_code ?? undefined,
        address: updatedRaw.address ?? undefined,
        description: updatedRaw.description ?? undefined,
        sosPhoneNumbers: parsedPhones,
        sosEmails: parsedEmails,
        isNameVerified: !!updatedRaw.isNameVerified,
        isPhoneVerified: !!updatedRaw.isPhoneVerified,
        isAddressVerified: !!updatedRaw.isAddressVerified,
      };

      setUser(updated);
      setOriginalUser(updated);
      // clear any local preview/file
      setAvatarFile(null);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl(null);
      }
      setMessage({ type: "success", text: "Picture removed." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to remove picture." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Validate phone exactly 10 digits
  const validatePhoneExact10 = (phone?: string) => {
    if (!phone) return "Phone required";
    if (!/^\d{10}$/.test(phone)) return "Phone must be exactly 10 digits";
    return "";
  };

  // Save handler (PUT /api/user). Supports multipart if avatarFile present
  const handleSave = async () => {
    if (!user) return;
    const phoneErr = validatePhoneExact10(user.phoneNumber);
    if (phoneErr) {
      // for global save validation we show top message briefly (but phone modal will show inline)
      setMessage({ type: "error", text: phoneErr });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // prepare user object to send - convert sos arrays to fields expected by server
      const outgoing: any = {
        ...user,
        // server expects arrays; route will stringify for DB
        sosPhoneNumbers: user.sosPhoneNumbers ?? [],
        sosEmails: user.sosEmails ?? [],
      };

      let payload: any;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("user", new Blob([JSON.stringify(outgoing)], { type: "application/json" }));
        fd.append("avatar", avatarFile);
        const res = await fetch("/api/user", { method: "PUT", body: fd });
        if (!res.ok) throw new Error("Save failed");
        payload = await res.json();
      } else {
        const res = await fetch("/api/user", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(outgoing),
        });
        if (!res.ok) throw new Error("Save failed");
        payload = await res.json();
      }

      const updatedRaw = payload.user ?? payload;

      // normalize returned row into User
      const parsedPhones: PhoneObj[] = (() => {
        const v = updatedRaw.sosPhoneNumbers ?? updatedRaw.sos_phone_numbers ?? null;
        if (!v) return [];
        if (typeof v === "string") {
          try {
            const parsed = JSON.parse(v);
            if (Array.isArray(parsed)) {
              return parsed.map((it: any) => (typeof it === "string" ? { countryCode: updatedRaw.countryCode ?? "+91", number: String(it) } : it));
            }
            return [];
          } catch {
            return [];
          }
        }
        if (Array.isArray(v)) {
          return v.map((it: any) => (typeof it === "string" ? { countryCode: updatedRaw.countryCode ?? "+91", number: String(it) } : it));
        }
        return [];
      })();

      const parsedEmails: string[] = (() => {
        const v = updatedRaw.sosEmails ?? updatedRaw.sos_emails ?? null;
        if (!v) return [];
        if (typeof v === "string") {
          try {
            const parsed = JSON.parse(v);
            return Array.isArray(parsed) ? parsed.map(String) : [];
          } catch {
            return [];
          }
        }
        if (Array.isArray(v)) return v.map(String);
        return [];
      })();

      const updated: User = {
        name: updatedRaw.name,
        email: updatedRaw.email,
        avatarUrl: updatedRaw.avatarUrl ?? updatedRaw.avatar_url ?? null,
        phoneNumber: updatedRaw.phoneNumber ?? updatedRaw.phone_number ?? undefined,
        countryCode: updatedRaw.countryCode ?? updatedRaw.country_code ?? undefined,
        address: updatedRaw.address ?? undefined,
        description: updatedRaw.description ?? undefined,
        sosPhoneNumbers: parsedPhones,
        sosEmails: parsedEmails,
        isNameVerified: !!updatedRaw.isNameVerified,
        isPhoneVerified: !!updatedRaw.isPhoneVerified,
        isAddressVerified: !!updatedRaw.isAddressVerified,
      };

      setUser(updated);
      setOriginalUser(updated);

      // clear local file & preview if uploaded
      setAvatarFile(null);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl(null);
      }

      setMessage({ type: "success", text: "Profile saved." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to save profile." });
    } finally {
      setSaving(false);
      // clear top message after a short time so it doesn't linger if it's an error corrected in a modal
      setTimeout(() => setMessage(null), 3500);
    }
  };

  // Per-field verify handlers (only mark that field verified locally)
  const verifyName = () => setUser((u) => (u ? { ...u, isNameVerified: true } : u));
  const verifyPhone = () => setUser((u) => (u ? { ...u, isPhoneVerified: true } : u));
  const verifyAddress = () => setUser((u) => (u ? { ...u, isAddressVerified: true } : u));

  // Determine SOS button appearance
  const sosCount = (user?.sosPhoneNumbers?.filter((p) => p?.number).length ?? 0) + (user?.sosEmails?.filter(Boolean).length ?? 0);
  const sosHasAny = sosCount > 0;
  const sosBtnClass = sosHasAny ? "bg-amber-400 text-slate-900" : "bg-red-600 text-white";
  const sosBtnText = sosHasAny ? "Edit SOS details" : "Add SOS details";

  if (loading) return <p className="text-center mt-10 animate-pulse text-gray-500">Loading profile...</p>;
  if (!user) return <p className="text-center mt-10">No user found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {message && (
        <div role={message.type === "error" ? "alert" : "status"} className={`rounded-md px-4 py-2 ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#00e2b7] to-teal-600 p-6 text-white shadow-lg flex items-center gap-4">
        <div className="relative inline-block">
          <button
            onClick={() => setShowAvatarMenu((s) => !s)}
            aria-haspopup="menu"
            aria-expanded={showAvatarMenu}
            title="Profile picture options"
            className="w-20 h-20 rounded-full overflow-hidden border-4 border-teal-600 bg-white/10 relative"
          >
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt="avatar" fill sizes="80px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xl font-semibold">
                {initials || "?"}
              </div>
            )}
          </button>

          {/* hidden file input (used by Change option) */}
          <input
            ref={avatarInputRef}
            id="avatar-input"
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAvatarPicked(f);
            }}
          />

          {/* Avatar menu - NOT clipped: sibling positioned below avatar */}
          {showAvatarMenu && (
            <div
              ref={avatarMenuRef}
              role="menu"
              aria-label="Avatar menu"
              className="absolute left-0 mt-2 w-44 bg-white rounded-lg shadow-lg text-slate-800 overflow-hidden z-50"
              style={{ top: "5.2rem", transform: "translateX(0)" }}
            >
              <button
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50"
                onClick={() => {
                  setShowAvatarMenu(false);
                  avatarInputRef.current?.click();
                }}
              >
                <Camera size={16} />
                Change profile picture
              </button>
              <button
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-red-600"
                onClick={() => {
                  setShowAvatarMenu(false);
                  handleDeleteAvatar();
                }}
              >
                <Trash2 size={16} />
                Delete profile picture
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{user.name || "—"}</h1>
          </div>
          <p className="text-sm text-teal-100">{user.email || "—"}</p>
        </div>
      </div>

      {/* Field cards */}
      <div className="space-y-4">
        <ProfileFieldCard label="Full name" value={user.name || "—"} verified={user.isNameVerified} onEdit={() => setEditingField("name")} onVerify={verifyName} showVerifyButton />
        <ProfileFieldCard label="Email" value={user.email || "—"} onEdit={() => setEditingField("email")} />

        {/* Combined Phone + Country code card */}
        <ProfileFieldCard
          label="Phone"
          value={`${user.countryCode || ""} ${user.phoneNumber ? user.phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3") : "—"}`}
          verified={user.isPhoneVerified}
          onEdit={() => setEditingField("phone")}
          onVerify={verifyPhone}
          showVerifyButton
        />

        <ProfileFieldCard label="Address" value={user.address || "—"} verified={user.isAddressVerified} onEdit={() => setEditingField("address")} onVerify={verifyAddress} showVerifyButton />
        <ProfileFieldCard label="About" value={user.description || "—"} onEdit={() => setEditingField("description")} />
      </div>

      {/* Actions row: Save left, SOS right */}
      <div className="flex items-center gap-4 justify-between">
        <div>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-6 py-3 rounded-xl font-semibold shadow-md transition ${hasChanges ? "bg-gradient-to-r from-[#00e2b7] to-teal-600 text-white" : "bg-slate-200 text-slate-600 cursor-not-allowed"}`}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

        <div>
          <button onClick={() => setShowSosModal(true)} className={`px-4 py-2 rounded-xl font-semibold shadow-md transition ${sosBtnClass}`}>
            {sosBtnText}
          </button>
        </div>
      </div>

      {/* Editor modals */}
      {editingField && user && (
        <FieldEditorModal
          field={editingField}
          onClose={() => setEditingField(null)}
          // sanitize avatarUrl so null -> undefined (matches FieldEditorModal's User prop)
          user={{ ...user, avatarUrl: user.avatarUrl ?? undefined }}
          onSave={(field, newVal) => {
            // apply field changes locally
            if (field === "phone") {
              const digits = newVal.replace(/\D/g, "");
              // field-level validation is handled inside modal — modal will only call onSave when valid
              setUser((prev) => (prev ? { ...prev, phoneNumber: digits } : prev));
            } else if (field === "countryCode") {
              setUser((prev) => (prev ? { ...prev, countryCode: newVal } : prev));
            } else if (field === "avatar") {
              setUser((prev) => (prev ? { ...prev, avatarUrl: newVal || undefined } : prev));
            } else {
              setUser((prev) => (prev ? ({ ...prev, [field]: newVal } as User) : prev));
            }
            // clear any top-level message that might have been set previously
            setMessage(null);
            setEditingField(null);
          }}
          countryCodes={countryCodes}
          onPickAvatar={(file) => {
            onAvatarPicked(file);
            setEditingField(null);
          }}
        />
      )}

      {/* SOS modal */}
      {showSosModal && user && (
        <SosModal
          initialPhones={user.sosPhoneNumbers && user.sosPhoneNumbers.length ? user.sosPhoneNumbers : [{ countryCode: user.countryCode ?? "+91", number: "" }]}
          initialEmails={user.sosEmails && user.sosEmails.length ? user.sosEmails : [""]}
          countryCodes={countryCodes}
          onClose={() => setShowSosModal(false)}
          onSave={(phones, emails) => {
            // phones: PhoneObj[]; emails: string[]
            // normalize and set on user
            setUser((prev) => (prev ? { ...prev, sosPhoneNumbers: phones.map((p) => ({ countryCode: p.countryCode, number: p.number })), sosEmails: emails.map((e) => e.trim()) } : prev));
            setShowSosModal(false);
          }}
        />
      )}
    </div>
  );
}