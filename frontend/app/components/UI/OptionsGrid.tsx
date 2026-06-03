// app/components/UI/OptionsGrid.tsx
'use client';

interface OptionsGridProps {
  options: { id: string | number; name: string }[];
  onSelect: (id: string | number, name: string) => void;
}

export default function OptionsGrid({ options, onSelect }: OptionsGridProps) {
  return (
    <div className="bg-gray-100/60 p-3 rounded-xl border border-dashed border-gray-300 grid grid-cols-1 gap-2 max-w-md w-full mb-4">
      {options.map((opt, index) => (
        <button
          key={opt.id || index}
          onClick={() => onSelect(opt.id, opt.name)}
          className="bg-white hover:bg-emerald-50 active:bg-gray-200 border border-gray-200 rounded-lg py-2.5 px-4 text-sm font-medium w-full text-left text-gray-700 focus:outline-none transition-all duration-200 shadow-sm"
        >
          {opt.name}
        </button>
      ))}
    </div>
  );
}