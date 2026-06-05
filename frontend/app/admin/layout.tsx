"use client";

import React, { useState } from "react";
import Sidebar from "./_components/shared/Sidebar";
import Navbar from "./_components/shared/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Global responsive responsive dynamic toggle view profile state controller hook
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans relative">
      
      {/* Clean independent structural components tracking execution logs */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main interface viewing grid container panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Dynamic nested routing childrens data inject slot */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}