// components/profile/SosModal.tsx
import React, { useMemo, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import type { CountryCodeItem } from "@/lib/countryCodes";

type PhoneObj = { countryCode: string; number: string };

type Props = {
  initialPhones?: PhoneObj[]; // optional, each { countryCode, number }
  initialEmails?: string[]; // optional
  countryCodes: CountryCodeItem[]; // from lib/countryCodes
  onClose: () => void;
  onSave: (phones: PhoneObj[], emails: string[]) => void;
};

function validatePhoneVal(v: string) {
  if (!v) return "";
  if (!/^\d{10}$/.test(v)) return "Must be exactly 10 digits";
  return "";
}
function validateEmailVal(v: string) {
  if (!v) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email";
  return "";
}

export default function SosModal({ initialPhones = [], initialEmails = [], countryCodes, onClose, onSave }: Props) {
  // ensure at least one field visible initially
  const [phones, setPhones] = useState<PhoneObj[]>(
    () => (initialPhones && initialPhones.length ? initialPhones.slice(0, 5) : [{ countryCode: countryCodes[0]?.code ?? "+91", number: "" }])
  );
  const [emails, setEmails] = useState<string[]>(
    () => (initialEmails && initialEmails.length ? initialEmails.slice(0, 5) : [""])
  );

  // errors arrays
  const [phoneErrors, setPhoneErrors] = useState<string[]>(() => Array(5).fill(""));
  const [emailErrors, setEmailErrors] = useState<string[]>(() => Array(5).fill(""));

  const maxItems = 5;
  const canAddPhone = phones.length < maxItems;
  const canAddEmail = emails.length < maxItems;

  const allValid = phones.every((p) => !p.number || !validatePhoneVal(p.number)) && emails.every((e) => !e || !validateEmailVal(e));

  const updatePhone = (idx: number, next: PhoneObj) => {
    const arr = phones.slice();
    arr[idx] = next;
    setPhones(arr);
    const err = validatePhoneVal(next.number);
    setPhoneErrors((s) => {
      const copy = s.slice();
      copy[idx] = err;
      return copy;
    });
  };

  const addPhone = () => {
    if (!canAddPhone) return;
    setPhones((p) => [...p, { countryCode: countryCodes[0]?.code ?? "+91", number: "" }].slice(0, maxItems));
  };

  const removePhone = (idx: number) => {
    setPhones((p) => {
      const copy = p.slice();
      copy.splice(idx, 1);
      return copy.length ? copy : [{ countryCode: countryCodes[0]?.code ?? "+91", number: "" }];
    });
  };

  const updateEmail = (idx: number, value: string) => {
    const arr = emails.slice();
    arr[idx] = value;
    setEmails(arr);
    const err = validateEmailVal(value);
    setEmailErrors((s) => {
      const copy = s.slice();
      copy[idx] = err;
      return copy;
    });
  };

  const addEmail = () => {
    if (!canAddEmail) return;
    setEmails((e) => [...e, ""].slice(0, maxItems));
  };

  const removeEmail = (idx: number) => {
    setEmails((e) => {
      const copy = e.slice();
      copy.splice(idx, 1);
      return copy.length ? copy : [""];
    });
  };

  // helper to quickly find country ISO (from countryCodes list)
  const isoForCode = (code?: string) => {
    if (!code) return "";
    const found = countryCodes.find((c) => c.code === code);
    return (found?.iso2 ?? "").toUpperCase();
  };

  // prepared options (keeps sorting you liked)
  const countryOptions = useMemo(() => countryCodes, [countryCodes]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-60 w-full max-w-2xl bg-white rounded-2xl shadow-lg p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Emergency contacts & emails</h3>

          {/* small X icon button instead of "Close" */}
          <button aria-label="Close" onClick={onClose} className="p-1 rounded hover:bg-slate-50 text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Phones first */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Emergency contacts</div>
            <div className="text-xs text-slate-500">Up to {maxItems}</div>
          </div>

          <div className="mt-3 space-y-2">
            {phones.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                {/* Country code area: native select is present but invisible; visible overlay shows compact text */}
                <div className="w-36 relative">
                  {/* Invisible native select sits on top to accept clicks & open native dropdown */}
                  <select
                    value={p.countryCode}
                    onChange={(e) => updatePhone(i, { ...p, countryCode: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                    aria-label={`Country code for phone ${i + 1}`}
                  >
                    {countryOptions.map((c) => (
                      <option key={c.iso2 ?? c.code} value={c.code}>
                        {c.emoji ? `${c.emoji} ` : ""}{c.label} ({c.code})
                      </option>
                    ))}
                  </select>

                  {/* Visible compact display: shows +91 and ISO (e.g. IN). pointer-events-none so clicks go to the select */}
                  <div className="relative z-10 pointer-events-none select-none flex items-center justify-center rounded-lg border px-2 py-2 bg-white/0 text-sm">
                    <span className="font-medium">{p.countryCode}</span>
                    <span className="ml-2 text-xs text-slate-500">{isoForCode(p.countryCode)}</span>
                    <ChevronDown className="ml-2 opacity-50" size={14} />
                  </div>
                </div>

                <div className="flex-1">
                  <input
                    value={p.number}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      updatePhone(i, { ...p, number: digits });
                    }}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="10-digit phone number"
                  />
                  {phoneErrors[i] && <div className="text-sm text-red-600 mt-1">{phoneErrors[i]}</div>}
                </div>

                <div className="flex items-start">
                  <button onClick={() => removePhone(i)} className="ml-2 text-sm px-2 py-1 rounded-md text-red-600 hover:bg-red-50" aria-label={`Remove phone ${i + 1}`}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <button onClick={addPhone} disabled={!canAddPhone} className={`px-3 py-2 rounded-xl text-sm ${canAddPhone ? "bg-slate-100" : "bg-slate-50 text-slate-400 cursor-not-allowed"}`}>
              + Add phone
            </button>
          </div>
        </div>

        {/* Emails next */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Emergency emails</div>
            <div className="text-xs text-slate-500">Up to {maxItems}</div>
          </div>

          <div className="mt-3 space-y-2">
            {emails.map((em, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1">
                  <input value={em} onChange={(e) => updateEmail(i, e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder={`Email ${i + 1}`} />
                  {emailErrors[i] && <div className="text-sm text-red-600 mt-1">{emailErrors[i]}</div>}
                </div>

                <div className="flex items-start">
                  <button onClick={() => removeEmail(i)} className="ml-2 text-sm px-2 py-1 rounded-md text-red-600 hover:bg-red-50" aria-label={`Remove email ${i + 1}`}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <button onClick={addEmail} disabled={!canAddEmail} className={`px-3 py-2 rounded-xl text-sm ${canAddEmail ? "bg-slate-100" : "bg-slate-50 text-slate-400 cursor-not-allowed"}`}>
              + Add email
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-xl bg-slate-100">Cancel</button>
          <button
            onClick={() => {
              // final validation
              const pErrs = phones.map((p) => validatePhoneVal(p.number));
              const eErrs = emails.map((e) => validateEmailVal(e));
              setPhoneErrors((_) => pErrs.concat(Array(Math.max(0, 5 - pErrs.length)).fill("")).slice(0, 5));
              setEmailErrors((_) => eErrs.concat(Array(Math.max(0, 5 - eErrs.length)).fill("")).slice(0, 5));
              const ok = pErrs.every((x) => !x) && eErrs.every((x) => !x);
              if (!ok) return;
              onSave(phones.filter((p) => p.number.trim()).slice(0, maxItems), emails.filter(Boolean).slice(0, maxItems));
            }}
            disabled={!allValid}
            className={`px-4 py-2 rounded-xl font-semibold ${allValid ? "bg-gradient-to-r from-[#00e2b7] to-teal-600 text-white" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`}
          >
            Save SOS
          </button>
        </div>
      </div>
    </div>
  );
}