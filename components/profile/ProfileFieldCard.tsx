// components/ProfileFieldCard.tsx
import React from "react";
import { Edit, Check } from "lucide-react";

export default function ProfileFieldCard({
  label,
  value,
  onEdit,
  verified,
  onVerify,
  showVerifyButton,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  verified?: boolean;
  onVerify?: () => void;
  showVerifyButton?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex items-start justify-between gap-4">
      <div>
        <label className="block text-xs text-slate-500">{label}</label>
        <div className="text-base font-medium">{value}</div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          {showVerifyButton && onVerify && (
            <button
              onClick={onVerify}
              className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
                verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
              }`}
              aria-pressed={!!verified}
            >
              <Check size={14} />
              {verified ? "Verified" : "Verify"}
            </button>
          )}

          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 rounded-md p-2"
              aria-label={`Edit ${label}`}
            >
              <Edit size={16} /> Edit
            </button>
          )}
        </div>

        {/* If verify button is not used, show simple badge */}
        {!showVerifyButton && typeof verified === "boolean" && (
          <div className={`${verified ? "text-green-600" : "text-amber-500"} text-sm`}>
            {verified ? "Verified" : "Not Verified"}
          </div>
        )}
      </div>
    </div>
  );
}