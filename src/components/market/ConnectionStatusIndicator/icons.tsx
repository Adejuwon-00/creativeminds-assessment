export const IdleIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5.5 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ConnectingIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
    <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ConnectedIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5.25 8.25 7.25 10.25 10.75 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ReconnectingIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
    <path
      d="M13 8a5 5 0 1 1-1.6-3.67"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path d="M13 2.5V5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DisconnectedIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5.75 5.75 10.25 10.25M10.25 5.75 5.75 10.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
