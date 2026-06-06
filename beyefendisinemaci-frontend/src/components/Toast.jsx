export default function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div
      className={`fixed bottom-8 right-8 rounded-lg px-6 py-4 text-sm z-[9999] shadow-2xl max-w-xs border ${
        type === "success"
          ? "bg-[#0a2a0a] border-[#2a6a2a] text-[#4caf50]"
          : "bg-[#2a1010] border-[#C62A2A] text-[#ff6b6b]"
      }`}
    >
      {message}
    </div>
  );
}
