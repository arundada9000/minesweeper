/**
 * Hand-drawn stroke icon set. No icon dependency: kept intentionally small,
 * offline, and consistent with the design tokens (currentColor, 1.6 stroke).
 * Icons are used in place of emoji or arbitrary Unicode symbols.
 */

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(props: IconProps): IconProps {
  const { size = 20, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...rest,
  };
}

export function FlagIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 3v18" />
      <path d="M5 4c3.5 0 4.5 1.5 8 1.5S18 3.5 21 3.5V12c-2 0-3.5 1.5-8 1.5S9.5 12 5 12" />
    </svg>
  );
}

export function QuestionIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M9.4 9.4a2.6 2.6 0 1 1 3.7 2.6c-.7.4-1.1 1-1.1 1.8" />
      <path d="M12 16.6h.01" />
    </svg>
  );
}

export function MineIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="6.5" y="5" width="3.2" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="14.3" y="5" width="3.2" height="14" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7.5 5.6v12.8a.6.6 0 0 0 .92.5l10.2-6.4a.6.6 0 0 0 0-1L8.42 5.1a.6.6 0 0 0-.92.5Z" />
    </svg>
  );
}

export function RestartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 3.5V8h-4.5" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 8.25a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Z" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.2L14.2 3h-4l-.3 2.7a7 7 0 0 0-2.1 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5.3 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.1 1.2l.3 2.7h4l.3-2.7a7 7 0 0 0 2.1-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ZapIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" />
    </svg>
  );
}

export function UndoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </svg>
  );
}

export function KeyboardIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M6 9.5h.01M9 9.5h.01M12 9.5h.01M15 9.5h.01M6 12.5h.01M9 12.5h.01M15 12.5h.01M18 9.5h.01M18 12.5h.01M10 15.5h4" />
    </svg>
  );
}

export function FlagCheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5.5 3v18" />
      <path d="M5.5 4c3 0 4.2 1.4 7.5 1.4S19 3.6 21 3.6V11c-1.8 0-3.2.9-8 .9s-5.5-.6-7.5-.3" />
      <path d="m3.5 16.5 2 2 4-4" />
    </svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4 2.8 19h18.4L12 4Z" />
      <path d="M12 10v4M12 16.5h.01" />
    </svg>
  );
}

export function SpeakerIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 9v6h3.5L12 19V5L7.5 9H4Z" />
      <path d="M15 9a4 4 0 0 1 0 6M17.5 7a7 7 0 0 1 0 10" />
    </svg>
  );
}

export function SpeakerOffIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 9v6h3.5L12 19V5L7.5 9H4Z" />
      <path d="m16 10 5 5M21 10l-5 5" />
    </svg>
  );
}

export function VibrateIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="8.5" y="4.5" width="7" height="15" rx="2" />
      <path d="M2 9v6M5.5 7.5v9M21.5 15V9M18.5 16.5v-9" />
    </svg>
  );
}

export function CrownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 8.5 8 12l4-6 4 6 4.5-3.5-1.5 9h-14l-1.5-9Z" />
      <path d="M5.5 19h13" />
    </svg>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4.5v1.5A3.5 3.5 0 0 0 8 10M17 5h2.5v1.5A3.5 3.5 0 0 1 16 10" />
      <path d="M12 13v4M8 20h8M9 17h6v3H9v-3Z" />
    </svg>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12a8 8 0 1 0 2.3-5.6L4 8.3" />
      <path d="M4 4v4.3h4.3" />
      <path d="M12 8v4l2.5 2" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function FlagOffIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 3v18" />
      <path d="M5 4h13l-2.5 4L18 12H5" />
      <path d="M4 21l16-18" />
    </svg>
  );
}

export function HelpIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9.5 9a2.5 2.5 0 1 1 3.7 2.2C12.1 11.8 12 12.4 12 13" />
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function CommandIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9Z" />
      <path d="M9 9v6H6.5A2.5 2.5 0 0 0 9 17.5V9Z" />
      <path d="M15 15h2.5a2.5 2.5 0 1 0-2.5-2.5V15Z" />
      <path d="M15 15V9h2.5A2.5 2.5 0 1 0 15 6.5V15Z" />
    </svg>
  );
}

export function MouseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="3" width="10" height="18" rx="5" />
      <path d="M12 6v3" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
    </svg>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 4c-8.5.5-13.5 3-15.5 8.5C3.3 15.6 5 19 8.5 19.5 14 20.4 20 13 20 4Z" />
      <path d="M6.5 18C9.5 14 13 10.5 17.5 7" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <path d="m10 14 1.5 1.5L14.5 13" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 13.5 9 19 10.5 13.5 12 12 17.5 10.5 12 5 10.5 10.5 9 12 3.5Z" />
      <path d="M18.5 15.5 19 17l1.5.5L19 18l-.5 1.5L18 18l-1.5-.5L18 17l.5-1.5Z" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M3.5 9h17M3.5 15h17M9 3.5v17M15 3.5v17" />
    </svg>
  );
}