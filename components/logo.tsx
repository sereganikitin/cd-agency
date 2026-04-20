export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Claws */}
      <path
        d="M14 24 C10 23 6 19 5 14 C5 11 8 10 10 11 C12 12 11.5 15 13 17 L16 21 Z"
        fill="#F472B6"
      />
      <circle cx="8" cy="14" r="1.6" fill="#0A0A0B" />
      <path
        d="M34 24 C38 23 42 19 43 14 C43 11 40 10 38 11 C36 12 36.5 15 35 17 L32 21 Z"
        fill="#F472B6"
      />
      <circle cx="40" cy="14" r="1.6" fill="#0A0A0B" />

      {/* Body */}
      <ellipse cx="24" cy="27" rx="11" ry="8" fill="#F472B6" />
      <ellipse cx="24" cy="25" rx="8" ry="4" fill="#FBCFE8" opacity="0.55" />

      {/* Eye stalks */}
      <line x1="21" y1="20" x2="20" y2="16" stroke="#F472B6" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="27" y1="20" x2="28" y2="16" stroke="#F472B6" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="15" r="1.6" fill="#0A0A0B" />
      <circle cx="28" cy="15" r="1.6" fill="#0A0A0B" />

      {/* Legs */}
      <path d="M14 29 L6 31" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 32 L8 36" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 34 L12 40" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
      <path d="M34 29 L42 31" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
      <path d="M33 32 L40 36" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
      <path d="M31 34 L36 40" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
