export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`logo ${className}`}>
      <svg viewBox="0 0 32 32" aria-hidden="true" className="logo-mark">
        <rect width="32" height="32" rx="9" fill="currentColor" />
        <g fill="var(--bg)">
          <rect x="7" y="13" width="3" height="6" rx="1.5" />
          <rect x="12" y="9" width="3" height="14" rx="1.5" />
          <rect x="17" y="11" width="3" height="10" rx="1.5" />
          <rect x="22" y="14" width="3" height="4" rx="1.5" />
        </g>
      </svg>
      <span className="logo-word">murmur</span>
    </span>
  );
}
