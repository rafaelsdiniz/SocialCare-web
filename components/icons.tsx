// Ícones inline (SVG) — sem dependências externas.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const IconHands = (props: P) => (
  // Logotipo: mãos formando uma casa
  <svg {...base(props)}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v9h14v-9" />
    <path d="M9 19v-4a3 3 0 0 1 6 0v4" />
  </svg>
);
export const IconHome = (props: P) => (
  <svg {...base(props)}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v10h14V10" />
  </svg>
);
export const IconUsers = (props: P) => (
  <svg {...base(props)}>
    <path d="M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="3.5" />
    <path d="M22 19v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.5A4 4 0 0 1 16 11" />
  </svg>
);
export const IconUser = (props: P) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);
export const IconCalendar = (props: P) => (
  <svg {...base(props)}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
);
export const IconClipboard = (props: P) => (
  <svg {...base(props)}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V3h6v1M9 11h6M9 15h6" />
  </svg>
);
export const IconArrowRight = (props: P) => (
  <svg {...base(props)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconShare = (props: P) => (
  <svg {...base(props)}>
    <path d="M7 12 17 5M7 12l10 7" />
    <circle cx="5" cy="12" r="2.5" />
    <circle cx="19" cy="5" r="2.5" />
    <circle cx="19" cy="19" r="2.5" />
  </svg>
);
export const IconGift = (props: P) => (
  <svg {...base(props)}>
    <rect x="3" y="8" width="18" height="13" rx="1.5" />
    <path d="M3 12h18M12 8v13M12 8S10 3 7.5 4.5 9.5 8 12 8s2-3.5 4.5-3.5S12 8 12 8" />
  </svg>
);
export const IconLayers = (props: P) => (
  <svg {...base(props)}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5M3 18l9 5 9-5" />
  </svg>
);
export const IconBuilding = (props: P) => (
  <svg {...base(props)}>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3" />
  </svg>
);
export const IconChart = (props: P) => (
  <svg {...base(props)}>
    <path d="M4 20V4M4 20h16M9 16v-5M14 16V8M19 16v-9" />
  </svg>
);
export const IconShield = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 3 5 6v6c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
export const IconLogout = (props: P) => (
  <svg {...base(props)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);
export const IconSearch = (props: P) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
export const IconPlus = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconCheck = (props: P) => (
  <svg {...base(props)}>
    <path d="m5 12 5 5L20 7" />
  </svg>
);
export const IconX = (props: P) => (
  <svg {...base(props)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IconAlert = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </svg>
);
export const IconMenu = (props: P) => (
  <svg {...base(props)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
export const IconHeart = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5C19 15.5 12 20 12 20Z" />
  </svg>
);
export const IconMap = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
export const IconChevronLeft = (props: P) => (
  <svg {...base(props)}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);
export const IconChevronRight = (props: P) => (
  <svg {...base(props)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
