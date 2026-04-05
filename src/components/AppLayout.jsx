import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageCircle, TrendingUp, User } from 'lucide-react';

const mobileNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/matches', icon: Users, label: 'Matches' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen grid-bg" style={{ background: 'var(--bg-deep)' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Header (hamburger) */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: 'var(--sidebar-bg)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl transition-all"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <span className="font-bold text-base" style={{ fontFamily: 'Bricolage Grotesque', color: 'var(--text-primary)' }}>
          Skill<span className="gradient-text">Swap</span>
        </span>
        <div style={{ width: 38 }} />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 z-50 sidebar-mobile ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{
          background: 'var(--sidebar-bg)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border)',
          boxShadow: sidebarOpen ? 'var(--shadow)' : 'none',
        }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen pt-[57px] md:pt-0 pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'var(--sidebar-bg)',
          borderTop: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive ? 'nav-item-active' : ''
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--sky)' : 'var(--text-secondary)',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} />
                  <span style={{ fontSize: '0.6rem', fontFamily: 'Lexend', fontWeight: isActive ? 600 : 400 }}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
