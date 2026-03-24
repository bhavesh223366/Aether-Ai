'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { text: 'Create New', href: '/dashboard', icon: '✨' },
  { text: 'My Videos', href: '/dashboard/videos', icon: '🎬' },
  { text: 'Schedule', href: '/dashboard/schedule', icon: '📅' },
  { text: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar glass-panel" style={{ width: '260px', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem 1.5rem' }}>
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`} 
            style={{ 
              justifyContent: 'flex-start', 
              width: '100%', 
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: isActive ? 'none' : '1px solid transparent'
            }}
          >
            <span style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}>{item.icon}</span>
            {item.text}
          </Link>
        );
      })}
    </aside>
  );
}
