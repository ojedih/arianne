"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import type { ServiceConfig } from "@/types";
import { formatCents } from "@/lib/pricing";

interface ServiceCardProps {
  service: ServiceConfig;
  selected: boolean;
  onToggle: () => void;
  /** When true: single-select mode — button reads "Select and continue" and radio indicator is shown */
  singleSelect?: boolean;
}

export function ServiceCard({ service, selected, onToggle, singleSelect = false }: ServiceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [emblaRef] = useEmblaCarousel({ loop: false });

  const hasImages = service.images.length > 0;

  function handleCardClick(e: React.MouseEvent) {
    // Don't collapse when clicking the select button
    if ((e.target as HTMLElement).closest("[data-select-btn]")) return;
    setExpanded((prev) => !prev);
  }

  return (
    <motion.div
      layout
      onClick={handleCardClick}
      className={`border-2 cursor-pointer transition-colors duration-200 overflow-hidden ${
        selected ? "bg-white" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
      style={{
        borderRadius: "var(--ui-radius-lg, 1rem)",
        borderColor: selected ? "var(--accent, #2563eb)" : undefined,
        backgroundColor: selected ? "var(--accent-light, #eff6ff)" : undefined,
      }}
    >
      {/* Collapsed header — always visible */}
      <div className="flex items-start gap-3 p-4">
        {/* Selection indicator — radio for single-select, checkbox for multi */}
        <div
          className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
          style={selected ? {
            borderColor: "var(--accent, #2563eb)",
            backgroundColor: "var(--accent, #2563eb)",
          } : { borderColor: "#d1d5db", backgroundColor: "white" }}
        >
          {selected && (
            singleSelect ? (
              <div className="w-2 h-2 rounded-full bg-white" />
            ) : (
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
            )
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-base leading-snug">
              {service.name}
            </h3>
            <span className="font-semibold text-sm shrink-0" style={{ color: "var(--accent, #2563eb)" }}>
              {formatCents(service.basePrice)}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5 leading-snug">
            {service.shortDescription}
          </p>
        </div>

        {/* Expand chevron */}
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

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* Image carousel */}
            {hasImages && (
              <div className="overflow-hidden mx-4 mb-3" style={{ borderRadius: "var(--ui-radius, 0.75rem)" }} ref={emblaRef}>
                <div className="flex">
                  {service.images.map((src, i) => (
                    <div
                      key={i}
                      className="relative flex-shrink-0 w-full aspect-video bg-gray-100 overflow-hidden"
                      style={{ borderRadius: "var(--ui-radius, 0.75rem)" }}
                    >
                      <Image
                        src={src}
                        alt={`${service.name} — photo ${i + 1}`}
                        fill
                        unoptimized={src.endsWith(".svg")}
                        className="object-cover"
                        sizes="(max-width: 512px) 100vw, 512px"
                        onError={(e) => {
                          // Hide broken images gracefully
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                      {/* Placeholder shown when image hasn't loaded */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center -z-10">
                        <svg
                          className="w-10 h-10 text-blue-200"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full description */}
            <div className="px-4 pb-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                {service.fullDescription}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" d="M12 6v6l4 2" />
                </svg>
                <span>~{service.durationMinutes} min</span>
              </div>

              {/* Select / Deselect button */}
              <button
                data-select-btn
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="mt-4 w-full h-11 font-semibold text-sm transition-colors text-white"
                style={{
                  backgroundColor: selected || singleSelect ? "var(--accent, #2563eb)" : "#111827",
                  borderRadius: "var(--ui-radius, 0.75rem)",
                }}
              >
                {singleSelect
                  ? selected
                    ? "Selected — continue"
                    : "Select and continue"
                  : selected
                  ? "Remove from booking"
                  : "Add to booking"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
