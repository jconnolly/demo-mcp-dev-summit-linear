import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconBacklog = ({ size = 14, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.6" strokeDasharray="4 2.5" strokeLinecap="round" />
  </svg>
);

export const IconTodo = ({ size = 14, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.4" />
  </svg>
);

export const IconInProgress = ({ size = 14, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.4" />
    <path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7 A5.5 5.5 0 0 1 7 12.5" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="butt" />
  </svg>
);

export const IconInReview = ({ size = 14, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.4" />
    <path d="M7 1.5 A5.5 5.5 0 1 1 1.5 7" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="butt" />
  </svg>
);

export const IconDone = ({ size = 14, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" fill={color} />
    <path d="M4.2 7.2l2 2 3.6-3.6" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconCancelled = ({ size = 14, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.4" />
    <path d="M4.8 4.8l4.4 4.4M9.2 4.8l-4.4 4.4" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const IconUrgent = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="14" height="14" rx="3" fill="#eb5757" />
    <path d="M8 4v5M8 11v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconPriorityHigh = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="8" width="3" height="7" rx="1" fill="#f07d3e" />
    <rect x="6.5" y="4" width="3" height="11" rx="1" fill="#f07d3e" />
    <rect x="12" y="1" width="3" height="14" rx="1" fill="#f07d3e" />
  </svg>
);

export const IconPriorityMedium = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="8" width="3" height="7" rx="1" fill="#f5a623" />
    <rect x="6.5" y="4" width="3" height="11" rx="1" fill="#f5a623" />
    <rect x="12" y="1" width="3" height="14" rx="1" fill="#4a4a52" />
  </svg>
);

export const IconPriorityLow = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="8" width="3" height="7" rx="1" fill="#a8a8b2" />
    <rect x="6.5" y="4" width="3" height="11" rx="1" fill="#4a4a52" />
    <rect x="12" y="1" width="3" height="14" rx="1" fill="#4a4a52" />
  </svg>
);

export const IconNoPriority = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="3" cy="8" r="1.5" fill="#4a4a52" />
    <circle cx="8" cy="8" r="1.5" fill="#4a4a52" />
    <circle cx="13" cy="8" r="1.5" fill="#4a4a52" />
  </svg>
);

export const IconPlus = ({ size = 14, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M7 2v10M2 7h10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconChevronDown = ({ size = 12, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M2 4l4 4 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconChevronRight = ({ size = 12, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M4 2l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconClose = ({ size = 14, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M2 2l10 10M12 2L2 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconSearch = ({ size = 14, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke={color} strokeWidth="1.3" />
    <path d="M9.5 9.5l2.5 2.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const IconIssues = ({ size = 16, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="14" height="14" rx="2" stroke={color} strokeWidth="1.3" />
    <circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.3" />
  </svg>
);

export const IconInbox = ({ size = 16, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M1 10h3l1.5 2h5l1.5-2H15V13a1 1 0 01-1 1H2a1 1 0 01-1-1v-3z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    <path d="M1 10L3.5 3A1 1 0 014.4 2h7.2a1 1 0 01.9.6L15 10" stroke={color} strokeWidth="1.3" fill="none" />
  </svg>
);

export const IconProjects = ({ size = 16, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M2 4h5v8H2zM9 2h5v10H9z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" />
  </svg>
);

export const IconViews = ({ size = 16, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="6" height="4" rx="1" stroke={color} strokeWidth="1.3" fill="none" />
    <rect x="9" y="3" width="6" height="4" rx="1" stroke={color} strokeWidth="1.3" fill="none" />
    <rect x="1" y="9" width="6" height="4" rx="1" stroke={color} strokeWidth="1.3" fill="none" />
    <rect x="9" y="9" width="6" height="4" rx="1" stroke={color} strokeWidth="1.3" fill="none" />
  </svg>
);

export const IconSettings = ({ size = 16, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2.5" stroke={color} strokeWidth="1.3" />
    <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.9 2.9l1.1 1.1M12 12l1.1 1.1M2.9 13.1l1.1-1.1M12 4l1.1-1.1" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const IconMyIssues = ({ size = 16, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" stroke={color} strokeWidth="1.3" />
    <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
  </svg>
);

export const IconTeam = ({ size = 16, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="6" cy="5" r="2.5" stroke={color} strokeWidth="1.3" />
    <circle cx="11" cy="5" r="2" stroke={color} strokeWidth="1.3" />
    <path d="M1 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
    <path d="M11 9c1.7.3 3 1.8 3 3.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
  </svg>
);

export const IconHash = ({ size = 16, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M5 2l-1.5 12M12.5 2L11 14M1.5 6h13M2 10h13" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const IconDots = ({ size = 14, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <circle cx="3" cy="7" r="1.2" fill={color} />
    <circle cx="7" cy="7" r="1.2" fill={color} />
    <circle cx="11" cy="7" r="1.2" fill={color} />
  </svg>
);

export const IconTrash = ({ size = 14, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M2 4h10M5 4V2h4v2M5.5 7v4M8.5 7v4M3 4l.7 8h6.6l.7-8" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconEdit = ({ size = 14, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M9.5 2.5l2 2L5 11H3v-2l6.5-6.5z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" />
  </svg>
);

export const IconComment = ({ size = 14, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H5l-3 2V3a1 1 0 011-1z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" />
  </svg>
);
