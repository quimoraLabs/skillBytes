"use client";
import {  Menu} from "lucide-react";
interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        {/* Menu layout controller button target for non-desktop layouts */}
        <button
          onClick={onMenuToggle}
          type="button"
          className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-lg focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-xs font-medium text-gray-400 hidden sm:inline-block">
          SkillBytes Admin Panel &bull; Production Workspace Engine
        </div>
      </div>
      
      {/* Mock Profile Avatar Bubble Icon Configuration */}
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xs font-bold text-emerald-800">
          AD
        </div>
      </div>
    </header>
  );
}