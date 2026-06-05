"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  BarChart3,
  ChevronDown,
  PlusCircle,
  BookOpen,
  FolderGit,
  Settings,
  Layout,
  X,
  Zap,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Updated Sidebar Schema to support Optional Children Routes and Lucide Icons
const sidebarLinks = [
  {
    name: "Content Management",
    path: "/admin/manage",
    icon: Layers,
    children: [
      { name: "Dashboard", path: "/admin/manage/", icon: Layout },
      {
        name: "Create Exam Entry",
        path: "/admin/manage/exam",
        icon: PlusCircle,
      },
      {
        name: "Subjects & Categories",
        path: "/admin/manage/subject",
        icon: BookOpen,
      },
      {
        name: "Topics & Chapters",
        path: "/admin/manage/chapter",
        icon: FolderGit,
      },
      { name: "Quizzes", path: "/admin/manage/quiz", icon: Settings },
    ],
  },
  {
    name: "Analysis Dashboard",
    path: "/admin/analysis",
    icon: BarChart3,
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Track open state for sub-menus (default true for content management if paths match)
  const [isContentOpen, setIsContentOpen] = useState(true);

  return (
    <>
      {/* MOBILE & TABLET BACKDROP OVERLAY (Active below 'lg' breakpoint) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR MAIN CONTAINER (Responsive rules now apply up to 'lg') */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#128c7e] text-white flex flex-col justify-between p-4 shrink-0 shadow-xl z-30 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Main Logo Header */}
          <div className="flex items-center justify-between px-3 py-4 mb-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-yellow-300 fill-yellow-300" />
              <span className="text-xl font-black tracking-wide">
                SkillBytes
              </span>
            </div>
            {/* Close toggle drawer button for mobile/tablet screen boundaries */}
            <button
              onClick={onClose}
              className="lg:hidden text-white hover:text-emerald-200 p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation link elements matrix mapping */}
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const IconComponent = link.icon;
              const hasChildren = link.children && link.children.length > 0;
              const isParentActive = pathname.startsWith(link.path);

              if (hasChildren) {
                return (
                  <div key={link.path} className="space-y-1">
                    {/* Collapsible Submenu Header Toggle Item */}
                    <button
                      onClick={() => setIsContentOpen(!isContentOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isParentActive
                          ? "bg-[#0b665c]/50 text-white"
                          : "text-emerald-100 hover:bg-[#0b665c]/40 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-4 w-4 shrink-0" />
                        <span>{link.name}</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transform transition-transform duration-200 ${isContentOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Submenu Children Routing Elements Container */}
                    {isContentOpen && (
                      <div className="pl-4 space-y-1 mt-1 transition-all">
                        {link.children?.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive = pathname === child.path;

                          return (
                            <Link
                              key={child.path}
                              href={child.path}
                              onClick={onClose} // Closes drawer if screen context is mobile/tablet
                              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-[11px] font-medium tracking-wide transition-all ${
                                isChildActive
                                  ? "bg-[#0b665c] text-white shadow-inner font-bold"
                                  : "text-emerald-200 hover:bg-[#0b665c]/30 hover:text-white"
                              }`}
                            >
                              <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                              <span>{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Standard Top-Level Routing Link Render Layer
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={onClose}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-[#0b665c] text-white shadow-inner"
                      : "text-emerald-100 hover:bg-[#0b665c]/40 hover:text-white"
                  }`}
                >
                  <IconComponent className="h-4 w-4 shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info lock context tracking tag */}
        <div className="pt-4 border-t border-emerald-700/50 text-[10px] uppercase font-bold text-emerald-300 tracking-widest px-4">
          Admin Portal Active
        </div>
      </aside>
    </>
  );
}
