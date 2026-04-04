import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Invalid credentials. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex grid-bg" style={{ background: 'var(--bg-deep)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 p-10 relative overflow-hidden"
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>
        <div className="orb w-64 h-64 -top-20 -left-20" style={{ background: '#38BDF8' }} />
        <div className="orb w-48 h-48 bottom-0 right-0" style={{ background: '#818CF8' }} />

        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #38BDF8, #818CF8)' }}>
            <Zap size={16} color="#07090F" fill="#07090F" />
          </div>
          <span className="font-bold text-lg" style={{ fontFamily: 'Bricolage Grotesque' }}>
            Skill<span className="gradient-text">Swap</span> AI
          </span>
        </Link>

        <div className="relative z-10">
          <div className="space-y-6">
            {[
              { title: 'No money needed', desc: 'Your skills are your currency' },
              { title: 'AI-powered matches', desc: 'Get paired with the perfect learning partner' },
              { title: 'Track your growth', desc: 'See your progress every step of the way' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full mt-0.5 shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.4)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: '#34D399' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ fontFamily: 'Bricolage Grotesque' }}>{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs relative z-10" style={{ color: 'var(--text-secondary)' }}>
          © 2025 SkillSwap AI
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm fade-in-up">
          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Bricolage Grotesque' }}>Welcome back</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Lexend' }}>
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-dark pl-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Lexend' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-dark pl-11 pr-11"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-secondary)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2"
              style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium" style={{ color: '#38BDF8' }}>
                Create one free
              </Link>
            </p>
          </div>

          {/* Demo hint */}
          <div className="mt-8 p-4 rounded-xl" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)' }}>
            <p className="text-xs" style={{ color: '#38BDF8', fontFamily: 'Lexend' }}>
              💡 <strong>Demo:</strong> Create a free account to explore all features — no credit card needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
