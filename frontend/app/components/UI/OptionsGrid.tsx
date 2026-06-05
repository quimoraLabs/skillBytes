"use client";

interface OptionItem {
  id: string | number;
  name: string;
}

interface OptionsGridProps {
  options: OptionItem[];
  onSelect: (id: string | number, name: string) => void;
  onBack?: () => void; 
}

export default function OptionsGrid({ options, onSelect, onBack }: OptionsGridProps) {
  
  // Dynamically verify if the data list array is completely empty or missing
  const hasNoOptions = !options || options.length === 0;

  return (
    <div className="w-full max-w-md space-y-2.5 my-1">
      
      {/* 🔄 DYNAMIC VIEW BLOCK: Renders either the functional selection buttons or a friendly notice text */}
      {!hasNoOptions ? (
        /* Render active grid items matrix when target dataset contains values */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          {options.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id, item.name)}
              className="w-full bg-white hover:bg-emerald-50 active:bg-emerald-100 border border-gray-200 hover:border-emerald-400 text-left text-xs py-3 px-4 rounded-xl font-medium text-gray-700 shadow-sm transition-all"
            >
              {item.name}
            </button>
          ))}
        </div>
      ) : (
        /* Render a simple, friendly coming soon note when content is missing */
        <div className="bg-white text-gray-800 p-3.5 rounded-2xl rounded-tl-none shadow-sm text-xs border border-gray-200/60 max-w-[85%] inline-block animate-fade-in">
          <p className="font-semibold text-emerald-700 mb-1">SkillBytes Bot 🤖</p>
          <p className="text-gray-600 leading-relaxed">
            Content coming soon here! Please go back and explore other sections. ✨⏳
          </p>
        </div>
      )}

      {/* 🎯 THE ONLY ONE SYSTEM BACK TRIGGER: Securely appended exactly once at the absolute bottom of the wrapper component */}
      {onBack && (
        <div className="pl-1 pt-0.5">
          <button
            onClick={onBack}
            className="text-xs font-bold text-gray-400 hover:text-emerald-700 transition-colors uppercase tracking-wider block"
          >
            Go Back ↩
          </button>
        </div>
      )}

    </div>
  );
}