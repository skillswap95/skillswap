import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, MessageCircle, TrendingUp,
  User, LogOut, Zap, Bell, Sun, Moon,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/matches', icon: Users, label: 'Find Matches' },
  { to: '/chat', icon: MessageCircle, label: 'Messages' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/profile', icon: User, label: 'My Profile' },
];

export default function Sidebar({ onClose }) {
  const { currentUser, userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === 'light';

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--sky), var(--indigo))' }}>
            <Zap size={16} color="#fff" fill="#fff" />
          </div>
          <span className="font-bold text-lg" style={{ fontFamily: 'Bricolage Grotesque', color: 'var(--text-primary)' }}>
            Skill<span className="gradient-text">Swap</span>
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all text-xs font-medium"
          style={{
            background: isLight ? 'rgba(245,158,11,0.12)' : 'rgba(129,140,248,0.12)',
            border: `1px solid ${isLight ? 'rgba(245,158,11,0.3)' : 'rgba(129,140,248,0.3)'}`,
            color: isLight ? '#D97706' : '#818CF8',
          }}
        >
          {isLight ? <Sun size={14} /> : <Moon size={14} />}
          {isLight ? 'Light' : 'Dark'}
        </button>
      </div>

      {/* User mini profile */}
      <div className="mx-4 mb-5 p-3 rounded-xl"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={userProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email}`}
              alt="avatar"
              className="w-9 h-9 rounded-full"
              style={{ border: '2px solid rgba(56,189,248,0.3)', background: 'var(--bg-elevated)' }}
            />
            <div className="status-dot absolute -bottom-0.5 -right-0.5" style={{ width: 8, height: 8 }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate" style={{ fontFamily: 'Bricolage Grotesque', color: 'var(--text-primary)' }}>
              {userProfile?.name || currentUser?.displayName || 'User'}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
              {userProfile?.level || 'Beginner'}
            </p>
          </div>
          <button
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Bell size={15} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1" onClick={onClose}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium border ${
                isActive ? 'nav-item-active' : 'border-transparent'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--sky)' : 'var(--text-secondary)',
              fontFamily: 'Lexend',
              background: 'transparent',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains('nav-item-active')) {
                e.currentTarget.style.background = 'var(--hover-bg)';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.classList.contains('nav-item-active')) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all text-sm"
          style={{ color: '#F87171', fontFamily: 'Lexend' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={17} />
          Sign Out
        </button>
        <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
          SkillSwap AI v1.0
        </p>
      </div>
    </div>
  );
}
