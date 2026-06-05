"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface FormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  nameValue: string;
  setNameValue: (val: string) => void;
  showDescription?: boolean;
  descValue?: string;
  setDescValue?: (val: string) => void;
  buttonText: string;
}

export default function Form({
  handleSubmit,
  nameValue,
  setNameValue,
  showDescription = false,
  descValue = "",
  setDescValue,
  buttonText
}: FormProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4"
    >
      <div>
        <h2 className="text-sm font-bold text-gray-800">Save Technical Catalog Node</h2>
        <p className="text-[11px] text-gray-400">Direct injection into the pre-selected parent context.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* FIELD 1: NAME */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Entry Name / Title
          </label>
          <input 
            type="text" 
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            placeholder="Type name here..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-all text-gray-700"
            required
          />
        </div>

        {/* FIELD 2: DESCRIPTION (Sirf tab dikhega jab flag true ho) */}
        {showDescription && (
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Description / Notes (Optional)
            </label>
            <textarea 
              value={descValue}
              onChange={(e) => setDescValue?.(e.target.value)} // Safe call with ?.
              placeholder="Enter details..."
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-all text-gray-700 resize-none"
            />
          </div>
        )}
        
        {/* SUBMIT BUTTON WITH MOTION HOVER */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full sm:w-auto bg-[#128c7e] hover:bg-[#0b665c] text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md transition-all uppercase tracking-wider"
        >
          {buttonText}
        </motion.button>
      </form>
    </motion.div>
  );
}
