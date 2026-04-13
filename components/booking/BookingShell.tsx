"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { useReducedMotion } from "framer-motion";

interface BookingShellProps {
  children: React.ReactNode;
}

export function BookingShell({ children }: BookingShellProps) {
  const pathname = usePathname();
  const direction = useBookingStore((s) => s.navigationDirection);
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: {
          x: direction === "forward" ? "100%" : "-100%",
          opacity: 0,
        },
        center: { x: 0, opacity: 1 },
        exit: {
          x: direction === "forward" ? "-100%" : "100%",
          opacity: 0,
        },
      };

  return (
    <div className="relative overflow-hidden flex-1 flex flex-col">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: prefersReducedMotion ? "tween" : "spring",
            stiffness: 300,
            damping: 30,
            duration: prefersReducedMotion ? 0.15 : undefined,
          }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
