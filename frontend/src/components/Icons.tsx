// Ícones em SVG puro, sem dependências externas (mesmo padrão do restante do
// projeto, que já renderiza tags web como <img>/<div> diretamente).

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const base = (size = 18) => ({ width: size, height: size, display: 'block' as const });

export function IconDashboard({ size = 18, color = '#666' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill={color} />
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill={color} opacity={0.5} />
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill={color} opacity={0.5} />
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill={color} />
    </svg>
  );
}

export function IconUsers({ size = 18, color = '#666' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V21" />
      <circle cx="9.5" cy="7.5" r="3.5" />
      <path d="M21 21v-1.5a4 4 0 0 0-3-3.87" />
      <path d="M15.5 4.13a3.5 3.5 0 0 1 0 6.74" />
    </svg>
  );
}

export function IconPersonalizar({ size = 18, color = '#666' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.5 7.5" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

export function IconSuporte({ size = 18, color = '#666' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1v-6h3v4z" />
      <path d="M3 19a2 2 0 0 0 2 2h1v-6H3v4z" />
    </svg>
  );
}

export function IconBell({ size = 18, color = '#666' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function IconSidebarToggle({ size = 18, color = '#555' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <line x1="9.5" y1="4" x2="9.5" y2="20" />
      <path d="M7 10l-2 2 2 2" />
    </svg>
  );
}

export function IconLogout({ size = 18, color = '#B00020' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function IconSearch({ size = 16, color = '#999' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IconFiltro({ size = 16, color = '#333' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="14" y2="6" />
      <line x1="4" y1="12" x2="10" y2="12" />
      <line x1="4" y1="18" x2="8" y2="18" />
      <circle cx="17" cy="6" r="2" />
      <circle cx="14" cy="12" r="2" />
      <circle cx="11" cy="18" r="2" />
    </svg>
  );
}

export function IconDots({ size = 18, color = '#666' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}

export function IconEye({ size = 15, color = '#555' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEdit({ size = 15, color = '#555' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function IconLock({ size = 15, color = '#B00020' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function IconUnlock({ size = 15, color = '#1B8A3B' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.5-2.2" />
    </svg>
  );
}

export function IconCheck({ size = 12, color = '#1B8A3B' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconBan({ size = 12, color = '#B00020' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function IconCalendar({ size = 14, color = '#999' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function IconIdCard({ size = 14, color = '#999' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <line x1="14" y1="10" x2="19" y2="10" />
      <line x1="14" y1="14" x2="19" y2="14" />
    </svg>
  );
}

export function IconTrendUp({ size = 13, color = '#1B8A3B' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 17 9 11 13 15 21 6" />
      <polyline points="14 6 21 6 21 13" />
    </svg>
  );
}

export function IconPalette({ size = 22, color = '#1A1A1A' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-.9.7-1.5 1.5-1.5H16a4 4 0 0 0 4-4c0-5.5-3.6-10-8-10z" />
      <circle cx="7.5" cy="10.5" r="1.2" fill={color} />
      <circle cx="11" cy="7" r="1.2" fill={color} />
      <circle cx="15.5" cy="8.5" r="1.2" fill={color} />
    </svg>
  );
}

export function IconImageIcon({ size = 22, color = '#1A1A1A' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

export function IconType({ size = 22, color = '#1A1A1A' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

export function IconPreview({ size = 22, color = '#1A1A1A' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconUpload({ size = 16, color = '#555' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function IconTrash({ size = 15, color = '#B00020' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function IconSave({ size = 16, color = '#1A1A1A' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export function IconAlert({ size = 30, color = '#B00020' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function IconInbox({ size = 40, color = '#CCC' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

export function IconHeadset({ size = 40, color = '#CCC' }: IconProps) {
  return (
    <svg style={base(size)} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1v-6h3v4z" />
      <path d="M3 19a2 2 0 0 0 2 2h1v-6H3v4z" />
    </svg>
  );
}