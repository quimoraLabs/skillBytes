"use client";

import React from 'react';

// 1. Fixed the structural array type syntax definition for TypeScript matching your data schemas
interface TableProps {
  data: {
    id?: string;
    name: string;
    description: string;
  }[]; 
  loading: boolean;
  header: string[];
}

const Table = ({ data, loading, header }: TableProps) => {
  if (loading) {
    return (
      <div className="w-full h-32 flex items-center justify-center text-xs font-medium text-gray-400 animate-pulse">
        Loading catalog matrix...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-32 flex items-center justify-center text-xs text-gray-400 italic">
        No dynamic data nodes found in context.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full border border-gray-100 rounded-xl bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-gray-100 text-white font-bold uppercase tracking-wider bg-[#128c7e] hover:bg-[#0b665c]">
            {header.map((title, index) => (
              <th key={index} className="py-3 px-4">
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 font-sans text-gray-600">
          {/* 2. Map row by row cleanly using data elements */}
          {data.map((item, index) => (
            <tr key={item.id || index} className="hover:bg-gray-200/50 transition-colors">
              {/* Render dynamic matching item values per concrete schema cell */}
              <td className="py-3 px-4 font-semibold text-gray-800">
                {item.name}
              </td>
              <td className="py-3 px-4 text-gray-400 max-w-xs truncate">
                {item.description || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
