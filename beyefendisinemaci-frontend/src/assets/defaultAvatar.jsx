export default function DefaultAvatar({ size = 130 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="50" fill="#1a1a2e" />
      <circle cx="50" cy="38" r="18" fill="#2a2a4e" />
      <ellipse cx="50" cy="85" rx="28" ry="20" fill="#2a2a4e" />
    </svg>
  );
}
