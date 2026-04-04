import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, MessageCircle, TrendingUp,
  User, LogOut, Zap, Bell
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/matches', icon: Users, label: 'Find Matches' },
  { to: '/chat', icon: MessageCircle, label: 'Messages' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/profile', icon: User, label: 'My Profile' },
];

export default function Sidebar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

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
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-50"
      style={{ background: 'rgba(10,14,24,0.95)', backdropFilter: 'blur(20px)', borderRight: '1px solid var(--border)' }}>
      
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #38BDF8, #818CF8)' }}>
            <Zap size={16} color="#07090F" fill="#07090F" />
          </div>
          <span className="font-display font-bold text-lg" style={{ fontFamily: 'Bricolage Grotesque' }}>
            Skill<span className="gradient-text">Swap</span>
          </span>
        </div>
      </div>

      {/* User mini profile */}
      <div className="mx-4 mb-6 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={userProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email}`}
              alt="avatar"
              className="w-9 h-9 rounded-full"
              style={{ border: '2px solid rgba(56,189,248,0.3)' }}
            />
            <div className="status-dot absolute -bottom-0.5 -right-0.5" style={{ width: 8, height: 8 }}></div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ fontFamily: 'Bricolage Grotesque' }}>
              {userProfile?.name || currentUser?.displayName || 'User'}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
              {userProfile?.level || 'Beginner'}
            </p>
          </div>
          <button className="ml-auto p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-secondary)' }}>
            <Bell size={15} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium border ${
                isActive
                  ? 'nav-item-active'
                  : 'border-transparent hover:bg-white/5'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? '#38BDF8' : 'var(--text-secondary)',
              fontFamily: 'Lexend',
            })}
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all text-sm hover:bg-red-500/10"
          style={{ color: '#F87171', fontFamily: 'Lexend' }}
        >
          <LogOut size={17} />
          Sign Out
        </button>
        <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)', color: '#334155' }}>
          SkillSwap AI v1.0
        </p>
      </div>
    </aside>
  );
}
