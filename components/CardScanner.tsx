"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Upload, Loader2, X, Sparkles } from "lucide-react";

export type ScannedFields = {
  full_name: string | null;
  position: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  country: string | null;
};

type Phase = "idle" | "camera" | "scanning" | "done" | "error";

// Scans a business card (camera photo or upload) and hands the extracted contact
// fields to the parent form via onExtract. The photo is sent for reading and is
// NOT stored. The AI step is dormant until ANTHROPIC_API_KEY is set server-side.
export default function CardScanner({ onExtract }: { onExtract: (fields: ScannedFields) => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function openCamera() {
    setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      setPhase("camera");
      // Attach after render so the <video> exists.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setMessage("Could not open the camera. Try Upload photo instead.");
      setPhase("error");
    }
  }

  function cancelCamera() {
    stopCamera();
    setPhase("idle");
  }

  async function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Draw the raw frame (not the mirrored preview) so text reads correctly.
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    await scan(dataUrl);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      setPhase("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") void scan(reader.result);
    };
    reader.onerror = () => {
      setMessage("Could not read that file.");
      setPhase("error");
    };
    reader.readAsDataURL(file);
  }

  async function scan(dataUrl: string) {
    setPhase("scanning");
    setMessage("");
    try {
      const res = await fetch("/api/scan-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      if (res.status === 401) { window.location.href = "/login"; return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.error ?? "Could not read the card. Please try again.");
        setPhase("error");
        return;
      }
      const f = (data?.fields ?? {}) as ScannedFields;
      const filled = Object.values(f).filter((v) => v).length;
      if (filled === 0) {
        setMessage("Nothing readable was found on the card. Try a clearer, closer photo.");
        setPhase("error");
        return;
      }
      onExtract(f);
      setCount(filled);
      setPhase("done");
    } catch {
      setMessage("Could not read the card. Please try again.");
      setPhase("error");
    }
  }

  const btn = "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors";

  return (
    <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />

      {phase === "camera" ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-lg bg-black">
            <video ref={videoRef} playsInline muted className="max-h-64 w-full object-contain" />
          </div>
          <p className="text-xs text-emerald-800">Fill the frame with the card, then capture. On a laptop the preview may look mirrored, the captured photo is correct.</p>
          <div className="flex gap-2">
            <button type="button" onClick={capture} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
              <Camera className="h-4 w-4" /> Capture
            </button>
            <button type="button" onClick={cancelCamera} className={`${btn} border border-ink-200 bg-white text-ink-600 hover:bg-ink-50`}>
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      ) : phase === "scanning" ? (
        <div className="flex items-center gap-2 text-sm text-emerald-800">
          <Loader2 className="h-4 w-4 animate-spin" /> Reading the card…
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white text-emerald-600">
              <Camera className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm font-semibold text-emerald-900">Scan a business card</p>
          </div>
          <p className="text-xs text-emerald-800">Snap or upload a card and we fill in the contact details for you. The photo is not stored. Review the fields before saving.</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={openCamera} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
              <Camera className="h-4 w-4" /> Scan with camera
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className={`${btn} border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-100`}>
              <Upload className="h-4 w-4" /> Upload photo
            </button>
          </div>
          {phase === "done" && (
            <p className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> Filled {count} field{count === 1 ? "" : "s"}. Check them below, then save.
            </p>
          )}
          {phase === "error" && message && (
            <p className="pt-1 text-xs font-medium text-amber-700">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}
