// components/trips/TripPhotosClient.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast"; // or your toast hook
import { X, Trash2 } from "lucide-react";

type Photo = {
  id: number;
  url: string;
  caption?: string | null;
  userId: number;
  createdAt?: string | null;
};

export default function TripPhotosClient({
  tripId,
  currentUser,
  initialPhotos,
}: {
  tripId: number;
  currentUser: { id: number; name?: string };
  initialPhotos: Photo[];
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos ?? []);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  // grid logic: if <=4 show all; if >4 show first 3 with "more" tile
  const previewCount = photos.length <= 4 ? photos.length : 4;
  const preview = photos.slice(0, previewCount);
  const extraCount = photos.length > 4 ? photos.length - 4 : 0;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentLightboxImage, setCurrentLightboxImage] = useState<null | Photo>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.append("image", f);
        // optional caption per-file: not implemented in UI; could be added
        const res = await fetch(`/api/trips/${tripId}/photos`, {
          method: "POST",
          body: fd,
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || "Upload failed");
        }
        // insert new photo at front
        setPhotos((p) => [json.photo, ...p]);
      }
      toast?.({ title: "Uploaded" });
    } catch (err: any) {
      toast?.({ title: "Upload failed", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photoId: number) {
    if (!confirm("Delete this photo?")) return;
    try {
      const res = await fetch(`/api/trips/${tripId}/photos/${photoId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Delete failed");
      setPhotos((p) => p.filter((x) => x.id !== photoId));
      toast?.({ title: "Deleted" });
    } catch (err: any) {
      toast?.({ title: "Delete failed", description: err?.message || String(err), variant: "destructive" });
    }
  }


  return (
    <div>
      {/* Upload row */}
      <div className="flex items-center gap-3 mb-4">
        <input
          ref={inputRef}
          id={`trip-photos-input-${tripId}`}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
        <Button
          size="sm"
          className="bg-gradient-to-r from-[#00e2b7] to-teal-600 text-white"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <span className="text-xl font-bold">+</span>Add photos
        </Button>
        <div className="text-sm text-slate-500">Anyone in the trip can upload / delete</div>
      </div>

      {/* Photos grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {preview.map((ph, idx) => (
          <div key={ph.id} className="relative rounded overflow-hidden">
            {idx === 3 && extraCount > 0 ? (
              <div
                className="flex items-center justify-center bg-slate-100 aspect-square cursor-pointer"
                onClick={() => setOpen(true)}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">+{extraCount}</div>
                  <div className="text-xs text-slate-600">View more</div>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={ph.url}
                  alt={ph.caption ?? "photo"}
                  className="w-full aspect-square object-cover rounded cursor-pointer"
                  onClick={() => { setCurrentLightboxImage(ph); setLightboxOpen(true); }}
                />
                <button
                  className="absolute top-1 right-1 bg-white/80 rounded p-1 text-xs transition transform hover:scale-110 hover:text-red-600"
                  title="Delete"
                  onClick={() => handleDelete(ph.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Gallery modal */}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value && lightboxOpen) return;
          setOpen(value);
        }}
      >
        <DialogContent className="max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Gallery</h3>
            <button
              aria-label="Close gallery"
              onClick={() => setOpen(false)}
              className="absolute right-2 top-2 rounded p-1 hover:bg-slate-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((ph) => (
              <div key={`all-${ph.id}`} className="relative rounded overflow-hidden">
                <img
                  src={ph.url}
                  alt={ph.caption ?? "photo"}
                  className="w-full h-48 object-cover rounded cursor-pointer"
                  onClick={() => { setCurrentLightboxImage(ph); setLightboxOpen(true); }}
                />
                <button
                  className="absolute top-2 right-2 bg-white/80 rounded p-1 text-xs transition transform hover:scale-110 hover:text-red-600"
                  title="Delete"
                  onClick={() => handleDelete(ph.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Lightbox for single-image viewing */}
      {lightboxOpen && currentLightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] pointer-events-auto flex items-center justify-center bg-black/75 p-4"
          onPointerDownCapture={(e) => e.stopPropagation()}
          onClick={() => setLightboxOpen(false)} // click backdrop to close
        >
          <div
            className="relative z-[100000] max-w-full max-h-[95vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // prevent backdrop close when clicking image container
          >
            {/* Close X (top-right) */}
            <button
              aria-label="Close image"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-2 top-2 z-[100001] rounded p-1 bg-white/90 hover:bg-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>

            <img
              src={currentLightboxImage.url}
              alt={currentLightboxImage.caption ?? "photo"}
              className="max-w-[98vw] max-h-[95vh] object-contain rounded shadow-xl"
              style={{ imageRendering: "auto" }}
            />

            {currentLightboxImage.caption && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded">
                {currentLightboxImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
