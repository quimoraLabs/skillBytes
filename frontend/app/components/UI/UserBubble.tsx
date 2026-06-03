export default function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end max-w-md ml-auto animate-fade-in mb-3">
      <div className="bg-[#dcf8c6] text-gray-800 rounded-lg rounded-tr-none p-3 shadow-sm text-sm font-medium">
        {text}
      </div>
    </div>
  );
}