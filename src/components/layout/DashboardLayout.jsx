"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F1F5F9] overflow-hidden">
      
      {/* SIDEBAR */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* TOPBAR */}
      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      {/* PAGE CONTENT ANIMATION */}
      <AnimatePresence mode="wait">
        <motion.main
          key={typeof window !== "undefined" ? window.location.pathname : "page"}
          initial={{
            opacity: 0,
            y: 40,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -20,
            scale: 0.98,
          }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="lg:ml-56 mt-16 lg:p-4 p-4"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}