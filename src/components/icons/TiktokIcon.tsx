import React from 'react';

export const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Path for TikTok logo (simplified) */}
    <path d="M16 4h-2a4 4 0 1 0 0 8h2v8a4 4 0 1 1-8 0" />
  </svg>
);