"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AddonConfig } from "@/types";
import { formatCents } from "@/lib/pricing";

interface AddonCardProps {
  addon: AddonConfig;
  selected: boolean;
  onToggle: () => void;
}

export function AddonCard({ addon, selected, onToggle }: AddonCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setExpanded((p) => !p)}
      className={`border-2 cursor-pointer transition-colors duration-200 overflow-hidden ${
        !selected ? "border-gray-200 bg-white hover:border-gray-300" : ""
      }`}
      style={{
        borderRadius: "var(--ui-radius-lg, 1rem)",
        borderColor: selected ? "var(--accent, #2563eb)" : undefined,
        backgroundColor: selected ? "var(--accent-light, #eff6ff)" : undefined,
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
          style={selected ? {
            borderColor: "var(--accent, #2563eb)",
            backgroundColor: "var(--accent, #2563eb)",
          } : { borderColor: "#d1d5db", backgroundColor: "white" }}
        >
          {selected && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-base leading-snug">
              {addon.name}
            </h3>
            <span className="font-semibold text-sm shrink-0" style={{ color: "var(--accent, #2563eb)" }}>
              +{formatCents(addon.price)}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5 leading-snug">
            {addon.shortDescription}
          </p>
        </div>

        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 mt-0.5"
        >
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                {addon.fullDescription}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="mt-4 w-full h-11 font-semibold text-sm transition-colors text-white"
                style={{
                  backgroundColor: selected ? "var(--accent, #2563eb)" : "#111827",
                  borderRadius: "var(--ui-radius, 0.75rem)",
                }}
              >
                {selected ? "Remove add-on" : "Add to booking"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
