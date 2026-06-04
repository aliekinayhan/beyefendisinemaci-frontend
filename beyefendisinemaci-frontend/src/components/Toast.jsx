export default function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        background: type === "success" ? "#0a2a0a" : "#2a1010",
        border: `1px solid ${type === "success" ? "#2a6a2a" : "#C62A2A"}`,
        color: type === "success" ? "#4caf50" : "#ff6b6b",
        borderRadius: "8px",
        padding: "1rem 1.5rem",
        fontSize: "0.9rem",
        zIndex: 9999,
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        maxWidth: "300px",
      }}
    >
      {message}
    </div>
  );
}
