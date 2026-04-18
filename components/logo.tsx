export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="38" height="38" rx="10" fill="#0A0A0B" stroke="#FF5A1F" strokeWidth="1.5" />
      <path
        d="M27 14c-1.8-1.6-4.2-2.5-6.8-2.5-5.6 0-9.7 3.9-9.7 8.8s4.1 8.8 9.7 8.8c2.6 0 5-0.9 6.8-2.5"
        stroke="#FFC300"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="29" cy="13" r="2" fill="#FF5A1F" />
    </svg>
  );
}
