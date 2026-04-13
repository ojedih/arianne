"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelButton({ token }: { token: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${token}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setConfirming(false);
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-3">
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}
        <p className="text-sm text-gray-600 text-center">
          Are you sure you want to cancel this appointment?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="flex-1 h-11 border border-gray-300 text-gray-700 font-semibold rounded-2xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Keep it
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 h-11 bg-red-600 text-white font-semibold rounded-2xl text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
      <button
        onClick={() => setConfirming(true)}
        className="w-full h-11 border border-red-300 text-red-600 font-semibold rounded-2xl text-sm hover:bg-red-50 transition-colors"
      >
        Cancel appointment
      </button>
    </div>
  );
}
