export default function BotBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start max-w-md animate-fade-in mb-3">
      <div className="bg-white text-gray-800 rounded-lg rounded-tl-none p-3 shadow-sm text-sm border-l-4 border-emerald-500">
        {text}
      </div>
    </div>
  );
}