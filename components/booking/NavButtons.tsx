"use client";

import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";

interface NavButtonsProps {
  nextHref?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  onNext?: () => void;
  backHref?: string;
  showBack?: boolean;
  loading?: boolean;
}

export function NavButtons({
  nextHref,
  nextLabel = "Continue",
  nextDisabled = false,
  onNext,
  backHref,
  showBack = true,
  loading = false,
}: NavButtonsProps) {
  const router = useRouter();
  const setDirection = useBookingStore((s) => s.setNavigationDirection);

  function handleNext() {
    setDirection("forward");
    if (onNext) {
      onNext();
    } else if (nextHref) {
      router.push(nextHref);
    }
  }

  function handleBack() {
    setDirection("backward");
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  }

  return (
    <div className="mt-auto pt-6 pb-safe flex flex-col gap-3">
      <button
        onClick={handleNext}
        disabled={nextDisabled || loading}
        className="w-full h-12 text-white font-semibold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        style={{
          backgroundColor: "var(--accent, #2563eb)",
          borderRadius: "var(--ui-radius-lg, 1rem)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-hover, #1d4ed8)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent, #2563eb)")}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing…
          </span>
        ) : (
          nextLabel
        )}
      </button>

      {showBack && (
        <button
          onClick={handleBack}
          className="w-full h-11 text-gray-500 font-medium text-sm rounded-2xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      )}
    </div>
  );
}
